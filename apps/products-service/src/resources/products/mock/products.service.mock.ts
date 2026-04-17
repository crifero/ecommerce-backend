import { allProductsStub, productStub } from '../../../database/stubs/product.stub';

export const ProductsServiceMock = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue(allProductsStub()),
  findOne: jest.fn().mockResolvedValue(productStub()),
  create: jest.fn().mockResolvedValue(productStub()),
  update: jest.fn().mockResolvedValue(productStub()),
  remove: jest.fn().mockResolvedValue({ message: 'Product 1 successfully removed' }),
});
