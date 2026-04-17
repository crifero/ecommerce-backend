import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Op } from 'sequelize';
import { Product } from '@models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginatedResponseBody } from '@libs/paginated-response-body';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async findAll(
    query: SearchProductDto,
  ): Promise<GetProductDto[] | PaginatedResponseBody<GetProductDto>> {
    const where: any = { isActive: true, wasDeleted: false };

    if (query.name) {
      where[Op.or as any] = [{ name: { [Op.iLike]: `%${query.name}%` } }];
    }

    if (query.paginated) {
      const page = query.page ?? 1;
      const size = query.size ?? 10;
      const offset = (page - 1) * size;

      const { rows, count } = await this.productModel.findAndCountAll({
        where,
        limit: size,
        offset,
        order: [['id', 'DESC']],
      });

      const data = this.mapper.mapArray(rows, Product, GetProductDto);
      return { data, total_results: count };
    }

    const products = await this.productModel.findAll({
      where,
      order: [['id', 'DESC']],
    });

    return this.mapper.mapArray(products, Product, GetProductDto);
  }

  async findOne(id: number): Promise<GetProductDto> {
    const product = await this.productModel.findOne({
      where: { id, isActive: true, wasDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.mapper.map(product, Product, GetProductDto);
  }

  async create(dto: CreateProductDto): Promise<GetProductDto> {
    const existing = await this.productModel.findOne({
      where: { name: dto.name, wasDeleted: false },
    });

    if (existing && existing.isActive) {
      throw new ConflictException(
        `Product with name "${dto.name}" already exists`,
      );
    } else if (existing && !existing.isActive) {
      await existing.update({ ...dto, isActive: true, wasDeleted: false });
      return this.mapper.map(existing, Product, GetProductDto);
    }

    const product = await this.productModel.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
      wasDeleted: false,
    } as any);

    return this.mapper.map(product, Product, GetProductDto);
  }

  async update(id: number, dto: UpdateProductDto): Promise<GetProductDto> {
    const product = await this.productModel.findOne({
      where: { id, wasDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await product.update(dto);
    return this.mapper.map(product, Product, GetProductDto);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.productModel.findOne({
      where: { id, wasDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await product.update({ isActive: false, wasDeleted: true });
    return { message: `Product ${id} successfully removed` };
  }
}
