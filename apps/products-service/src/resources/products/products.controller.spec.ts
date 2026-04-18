import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsServiceMock } from './mock/products.service.mock';
import { productStub, allProductsStub } from '../../database/stubs/product.stub';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    })
      .overrideProvider(ProductsService)
      .useClass(ProductsServiceMock)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (_ctx: ExecutionContext) => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: (_ctx: ExecutionContext) => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const query: SearchProductDto = {};
      const result = await controller.findAll(query);
      expect(result).toStrictEqual(allProductsStub());
    });

    it('should call service.findAll with query params', async () => {
      const query: SearchProductDto = { paginated: true, page: 1, size: 5 };
      await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = await controller.findOne(1);
      expect(result).toStrictEqual(productStub());
    });

    it('should call service.findOne with the correct id', async () => {
      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when service throws it', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Laptop Pro 15',
      price: 1299.99,
      stock: 50,
    };

    it('should create and return a product', async () => {
      const result = await controller.create(createDto);
      expect(result).toStrictEqual(productStub());
    });

    it('should call service.create with the DTO', async () => {
      await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { price: 999.99 };

    it('should update and return the product', async () => {
      const result = await controller.update(1, updateDto);
      expect(result).toStrictEqual(productStub());
    });

    it('should call service.update with id and DTO', async () => {
      await controller.update(1, updateDto);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.update(999, updateDto)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should return success message', async () => {
      const result = await controller.remove(1);
      expect(result.message).toContain('1');
    });

    it('should call service.remove with the correct id', async () => {
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.remove(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
