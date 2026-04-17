import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ProductsService } from './products.service';
import { ProductProfile } from './mapper/product.profile';
import { Product } from '@models/product.model';
import { ProductModelMock } from '../../database/mocks/product.model.mock';
import { productStub, allProductsStub } from '../../database/stubs/product.stub';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModelMock: ProductModelMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        ProductProfile,
        {
          provide: getModelToken(Product),
          useClass: ProductModelMock,
        },
      ],
      imports: [
        AutomapperModule.forRoot({ strategyInitializer: classes() }),
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModelMock = module.get<ProductModelMock>(getModelToken(Product));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all active products as array', async () => {
      const query: SearchProductDto = {};
      const result = await service.findAll(query);
      expect(productModelMock.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return paginated response when paginated=true', async () => {
      const query: SearchProductDto = { paginated: true, page: 1, size: 10 };
      const result = await service.findAll(query);
      expect(productModelMock.findAndCountAll).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total_results');
    });

    it('should filter by name when provided', async () => {
      const query: SearchProductDto = { name: 'Laptop' };
      await service.findAll(query);
      expect(productModelMock.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const result = await service.findOne(1);
      expect(productModelMock.findOne).toHaveBeenCalled();
      expect(result.id).toBe(productStub().id);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      productModelMock.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      price: 99.99,
      stock: 10,
    };

    it('should create a product successfully', async () => {
      productModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.create(createDto);
      expect(productModelMock.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if active product with same name exists', async () => {
      productModelMock.findOne.mockResolvedValueOnce({
        ...allProductsStub()[0],
        isActive: true,
      } as any);
      await expect(service.create(createDto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('should reactivate soft-deleted product with same name', async () => {
      const deleted = {
        ...allProductsStub()[0],
        name: createDto.name,
        isActive: false,
        update: jest.fn().mockResolvedValue(true),
      };
      productModelMock.findOne.mockResolvedValueOnce(deleted as any);
      await service.create(createDto);
      expect(deleted.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true, wasDeleted: false }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { price: 999.99 };

    it('should update a product successfully', async () => {
      const product = {
        ...allProductsStub()[0],
        update: jest.fn().mockResolvedValue(true),
      };
      productModelMock.findOne.mockResolvedValueOnce(product as any);
      const result = await service.update(1, updateDto);
      expect(product.update).toHaveBeenCalledWith(updateDto);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      productModelMock.findOne.mockResolvedValueOnce(null);
      await expect(service.update(999, updateDto)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a product', async () => {
      const product = {
        ...allProductsStub()[0],
        update: jest.fn().mockResolvedValue(true),
      };
      productModelMock.findOne.mockResolvedValueOnce(product as any);
      const result = await service.remove(1);
      expect(product.update).toHaveBeenCalledWith({ isActive: false, wasDeleted: true });
      expect(result.message).toContain('1');
    });

    it('should throw NotFoundException when product does not exist', async () => {
      productModelMock.findOne.mockResolvedValueOnce(null);
      await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
