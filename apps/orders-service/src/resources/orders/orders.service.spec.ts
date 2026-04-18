import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { Sequelize } from 'sequelize-typescript';
import axios from 'axios';
import { OrdersService } from './orders.service';
import { OrderProfile } from './mapper/order.profile';
import { Order } from '@models/order.model';
import { OrderItem } from '@models/order-item.model';
import { OrderStatus } from '@models/order-status.model';
import { OrderModelMock } from '../../database/mocks/order.model.mock';
import { OrderItemModelMock } from '../../database/mocks/order-item.model.mock';
import { OrderStatusModelMock } from '../../database/mocks/order-status.model.mock';
import { orderStub, allOrdersStub } from '../../database/stubs/order.stub';
import { CreateOrderDto } from './dto/create-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
};

const TEST_USER_ID = 1;

const productResponse = {
  data: {
    data: {
      id: 1,
      name: 'Laptop Pro 15',
      price: 1299.99,
      stock: 50,
      isActive: true,
    },
  },
};

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModelMock: OrderModelMock;
  let orderItemModelMock: OrderItemModelMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        OrderProfile,
        { provide: getModelToken(Order), useClass: OrderModelMock },
        { provide: getModelToken(OrderItem), useClass: OrderItemModelMock },
        { provide: getModelToken(OrderStatus), useClass: OrderStatusModelMock },
        { provide: Sequelize, useValue: mockSequelize },
      ],
      imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModelMock = module.get<OrderModelMock>(getModelToken(Order));
    orderItemModelMock = module.get<OrderItemModelMock>(getModelToken(OrderItem));
  });

  afterEach(() => jest.clearAllMocks());

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all orders as array', async () => {
      const result = await service.findAll({}, TEST_USER_ID);
      expect(orderModelMock.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by userId', async () => {
      await service.findAll({}, TEST_USER_ID);
      const callArg = orderModelMock.findAll.mock.calls[0][0];
      expect(callArg.where).toMatchObject({ userId: TEST_USER_ID });
    });

    it('should filter wasDeleted=false', async () => {
      await service.findAll({}, TEST_USER_ID);
      const callArg = orderModelMock.findAll.mock.calls[0][0];
      expect(callArg.where).toMatchObject({ wasDeleted: false });
    });

    it('should apply date range when startDate and endDate provided', async () => {
      await service.findAll({ startDate: '2026-04-01', endDate: '2026-04-18' }, TEST_USER_ID);
      const callArg = orderModelMock.findAll.mock.calls[0][0];
      expect(callArg.where.createdAt).toBeDefined();
    });

    it('should set endDate to end of day (23:59:59)', async () => {
      await service.findAll({ startDate: '2026-04-01', endDate: '2026-04-18' }, TEST_USER_ID);
      const callArg = orderModelMock.findAll.mock.calls[0][0];
      const endDate: Date = callArg.where.createdAt[require('sequelize').Op.lte];
      expect(endDate.getUTCHours()).toBe(23);
      expect(endDate.getUTCMinutes()).toBe(59);
      expect(endDate.getUTCSeconds()).toBe(59);
    });

    it('should not apply date range when only startDate provided', async () => {
      await service.findAll({ startDate: '2026-04-01' }, TEST_USER_ID);
      const callArg = orderModelMock.findAll.mock.calls[0][0];
      expect(callArg.where.createdAt).toBeUndefined();
    });

    it('should return paginated response when paginated=true', async () => {
      const query: SearchOrderDto = { paginated: true, page: 1, size: 10 };
      const result = await service.findAll(query, TEST_USER_ID);
      expect(orderModelMock.findAndCountAll).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total_results');
    });

    it('should use default page=1 and size=10 when not provided', async () => {
      await service.findAll({ paginated: true }, TEST_USER_ID);
      const callArg = orderModelMock.findAndCountAll.mock.calls[0][0];
      expect(callArg.limit).toBe(10);
      expect(callArg.offset).toBe(0);
    });

    it('should compute correct offset for page 2', async () => {
      await service.findAll({ paginated: true, page: 2, size: 5 }, TEST_USER_ID);
      const callArg = orderModelMock.findAndCountAll.mock.calls[0][0];
      expect(callArg.limit).toBe(5);
      expect(callArg.offset).toBe(5);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const order = {
        ...allOrdersStub()[0],
        statusId: 1,
        wasDeleted: false,
        status: { description: 'pending' },
        items: allOrdersStub()[0].items,
      };
      orderModelMock.findOne.mockResolvedValueOnce(order);
      const result = await service.findOne(1, TEST_USER_ID);
      expect(result.id).toBe(orderStub().id);
    });

    it('should query with id and userId', async () => {
      const order = { ...allOrdersStub()[0], statusId: 1, wasDeleted: false, status: { description: 'pending' }, items: [] };
      orderModelMock.findOne.mockResolvedValueOnce(order);
      await service.findOne(1, TEST_USER_ID);
      const callArg = orderModelMock.findOne.mock.calls[0][0];
      expect(callArg.where).toMatchObject({ id: 1, userId: TEST_USER_ID, wasDeleted: false });
    });

    it('should throw NotFoundException when order does not exist', async () => {
      orderModelMock.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(999, TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw NotFoundException when order belongs to another user', async () => {
      orderModelMock.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1, 999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto: CreateOrderDto = {
      items: [{ productId: 1, quantity: 2 }],
    };

    it('should create an order successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(productResponse);
      const createdOrder = { id: 3, statusId: 1, total: 2599.98, status: { description: 'pending' }, items: [], wasDeleted: false };
      orderModelMock.create.mockResolvedValueOnce(createdOrder);
      orderItemModelMock.create.mockResolvedValueOnce({});
      orderModelMock.findOne.mockResolvedValueOnce({
        ...createdOrder,
        items: [{ ...productResponse.data.data, quantity: 2, subtotal: 2599.98 }],
      });

      const result = await service.create(createDto, TEST_USER_ID);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create order with correct userId', async () => {
      mockedAxios.get.mockResolvedValueOnce(productResponse);
      const createdOrder = { id: 3, userId: TEST_USER_ID, statusId: 1, total: 2599.98, status: { description: 'pending' }, items: [], wasDeleted: false };
      orderModelMock.create.mockResolvedValueOnce(createdOrder);
      orderItemModelMock.create.mockResolvedValueOnce({});
      orderModelMock.findOne.mockResolvedValueOnce({ ...createdOrder, items: [] });

      await service.create(createDto, TEST_USER_ID);
      const callArg = orderModelMock.create.mock.calls[0][0];
      expect(callArg.userId).toBe(TEST_USER_ID);
    });

    it('should calculate total correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce(productResponse);
      const createdOrder = { id: 3, statusId: 1, total: 2599.98, status: { description: 'pending' }, items: [], wasDeleted: false };
      orderModelMock.create.mockResolvedValueOnce(createdOrder);
      orderItemModelMock.create.mockResolvedValueOnce({});
      orderModelMock.findOne.mockResolvedValueOnce({ ...createdOrder, items: [] });

      await service.create(createDto, TEST_USER_ID);
      const callArg = orderModelMock.create.mock.calls[0][0];
      expect(callArg.total).toBeCloseTo(1299.99 * 2);
    });

    it('should throw ServiceUnavailableException when products-service times out', async () => {
      mockedAxios.get.mockRejectedValueOnce({ isAxiosError: true, code: 'ECONNABORTED' });
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when products-service is down', async () => {
      mockedAxios.get.mockRejectedValueOnce({ isAxiosError: true, code: 'ECONNREFUSED' });
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not exist (404)', async () => {
      const error = { isAxiosError: true, response: { status: 404 } };
      mockedAxios.get.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValue(true);
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException when product is inactive', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: { ...productResponse.data.data, isActive: false } } });
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: { ...productResponse.data.data, stock: 1 } } });
      await expect(service.create({ items: [{ productId: 1, quantity: 5 }] }, TEST_USER_ID)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should rollback transaction on DB error', async () => {
      mockedAxios.get.mockResolvedValueOnce(productResponse);
      orderModelMock.create.mockRejectedValueOnce(new Error('DB error'));
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toThrow('DB error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should not commit when transaction fails', async () => {
      mockedAxios.get.mockResolvedValueOnce(productResponse);
      orderModelMock.create.mockRejectedValueOnce(new Error('fail'));
      await expect(service.create(createDto, TEST_USER_ID)).rejects.toThrow();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });
});
