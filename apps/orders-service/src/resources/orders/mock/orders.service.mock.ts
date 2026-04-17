import { allOrdersStub, orderStub } from '../../../database/stubs/order.stub';

export const OrdersServiceMock = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue(allOrdersStub()),
  findOne: jest.fn().mockResolvedValue(orderStub()),
  create: jest.fn().mockResolvedValue(orderStub()),
});
