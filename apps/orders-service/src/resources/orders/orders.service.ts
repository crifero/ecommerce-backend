import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import axios from 'axios';

const PRODUCTS_TIMEOUT_MS = 5000;
import { Order } from '@models/order.model';
import { OrderItem } from '@models/order-item.model';
import { OrderStatus } from '@models/order-status.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { PaginatedResponseBody } from '@libs/paginated-response-body';

interface ProductData {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

@Injectable()
export class OrdersService {
  private readonly productsUrl: string;

  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(OrderStatus) private readonly statusModel: typeof OrderStatus,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly sequelize: Sequelize,
  ) {
    this.productsUrl = process.env.PRODUCTS_SERVICE_URL;
  }

  async findAll(
    query: SearchOrderDto,
  ): Promise<GetOrderDto[] | PaginatedResponseBody<GetOrderDto>> {
    const where: any = { wasDeleted: false };

    if (query.startDate && query.endDate) {
      where.createdAt = {
        [Op.gte]: new Date(query.startDate),
        [Op.lte]: new Date(query.endDate),
      };
    }

    const include = [
      { model: OrderStatus, as: 'status' },
      { model: OrderItem, as: 'items', where: { wasDeleted: false }, required: false },
    ];

    if (query.paginated) {
      const page = query.page ?? 1;
      const size = query.size ?? 10;
      const offset = (page - 1) * size;

      const { rows, count } = await this.orderModel.findAndCountAll({
        where,
        include,
        limit: size,
        offset,
        order: [['id', 'DESC']],
        distinct: true,
      });

      const data = this.mapper.mapArray(rows, Order, GetOrderDto);
      return { data, total_results: count };
    }

    const orders = await this.orderModel.findAll({
      where,
      include,
      order: [['id', 'DESC']],
    });

    return this.mapper.mapArray(orders, Order, GetOrderDto);
  }

  async findOne(id: number): Promise<GetOrderDto> {
    const order = await this.orderModel.findOne({
      where: { id, wasDeleted: false },
      include: [
        { model: OrderStatus, as: 'status' },
        { model: OrderItem, as: 'items', where: { wasDeleted: false }, required: false },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.mapper.map(order, Order, GetOrderDto);
  }

  private async fetchAndValidateProduct(
    productId: number,
    quantity: number,
  ): Promise<ProductData> {
    let productData: ProductData;

    try {
      const response = await axios.get<{ data: ProductData }>(
        `${this.productsUrl}/api/v1/products/${productId}`,
        { timeout: PRODUCTS_TIMEOUT_MS },
      );
      productData = response.data.data ?? (response.data as any);
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        throw new ServiceUnavailableException(
          'Products service timed out. Please try again later.',
        );
      }
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        throw new NotFoundException(`Product ${productId} not found`);
      }
      throw new ServiceUnavailableException(
        'Products service is unavailable. Please try again later.',
      );
    }

    if (!productData.isActive) {
      throw new BadRequestException(
        `Product "${productData.name}" is not available`,
      );
    }

    if (productData.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${productData.name}". Available: ${productData.stock}`,
      );
    }

    return productData;
  }

  async create(dto: CreateOrderDto): Promise<GetOrderDto> {
    const resolvedItems = await Promise.all(
      dto.items.map(async (item) => ({
        product: await this.fetchAndValidateProduct(item.productId, item.quantity),
        quantity: item.quantity,
      })),
    );

    const transaction = await this.sequelize.transaction();

    try {
      const total = resolvedItems.reduce(
        (sum, { product, quantity }) => sum + Number(product.price) * quantity,
        0,
      );

      const order = await this.orderModel.create(
        {
          statusId: 1,
          total,
          observations: dto.observations ?? null,
          isActive: true,
          wasDeleted: false,
        } as any,
        { transaction },
      );

      for (const { product, quantity } of resolvedItems) {
        const subtotal = Number(product.price) * quantity;

        await this.orderItemModel.create(
          {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity,
            subtotal,
          } as any,
          { transaction },
        );
      }

      await transaction.commit();

      return this.findOne(order.id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
