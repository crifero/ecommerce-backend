import { GetProductDto } from '../../resources/products/dto/get-product.dto';

export const allProductsStub = (): (GetProductDto & { wasDeleted: boolean })[] => [
  {
    id: 1,
    name: 'Laptop Pro 15',
    description: 'High performance laptop',
    price: 1299.99,
    stock: 50,
    isActive: true,
    wasDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 49.99,
    stock: 200,
    isActive: true,
    wasDeleted: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export const productStub = (): GetProductDto => allProductsStub()[0];
