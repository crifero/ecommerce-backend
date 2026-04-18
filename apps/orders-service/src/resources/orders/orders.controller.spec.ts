import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersServiceMock } from './mock/orders.service.mock';
import { orderStub, allOrdersStub } from '../../database/stubs/order.stub';
import { CreateOrderDto } from './dto/create-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { JwtPayload } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

const mockUser: JwtPayload = { sub: 1, email: 'test@example.com', role: 'user' };

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService],
    })
      .overrideProvider(OrdersService)
      .useClass(OrdersServiceMock)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const query: SearchOrderDto = {};
      const result = await controller.findAll(query, mockUser);
      expect(result).toStrictEqual(allOrdersStub());
    });

    it('should call service.findAll with query params', async () => {
      const query: SearchOrderDto = { paginated: true, page: 1, size: 5 };
      await controller.findAll(query, mockUser);
      expect(service.findAll).toHaveBeenCalledWith(query, mockUser.sub);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const result = await controller.findOne(1, mockUser);
      expect(result).toStrictEqual(orderStub());
    });

    it('should call service.findOne with the correct id', async () => {
      await controller.findOne(1, mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1, mockUser.sub);
    });

    it('should throw NotFoundException when service throws it', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne(999, mockUser)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateOrderDto = {
      items: [{ productId: 1, quantity: 2 }],
    };

    it('should create and return an order', async () => {
      const result = await controller.create(createDto, mockUser);
      expect(result).toStrictEqual(orderStub());
    });

    it('should call service.create with the DTO', async () => {
      await controller.create(createDto, mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.sub);
    });

    it('should throw NotFoundException when a product does not exist', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.create(createDto, mockUser)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ServiceUnavailableException when products-service is down', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new ServiceUnavailableException());
      await expect(controller.create(createDto, mockUser)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });
});
