import { GetOrderDto, GetOrderItemDto } from '../../resources/orders/dto/get-order.dto';

export const orderItemStub = (): GetOrderItemDto => ({
  id: 1,
  productId: 1,
  productName: 'Laptop Pro 15',
  productPrice: 1299.99,
  quantity: 2,
  subtotal: 2599.98,
});

export const allOrdersStub = (): GetOrderDto[] => [
  {
    id: 1,
    status: 'pending',
    total: 2599.98,
    observations: null,
    items: [orderItemStub()],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    status: 'delivered',
    total: 49.99,
    observations: 'Urgent delivery',
    items: [
      {
        id: 2,
        productId: 2,
        productName: 'Wireless Mouse',
        productPrice: 49.99,
        quantity: 1,
        subtotal: 49.99,
      },
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export const orderStub = (): GetOrderDto => allOrdersStub()[0];
