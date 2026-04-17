import { BaseModelMock } from './base-model.mock';
import { orderItemStub } from '../stubs/order.stub';

export class OrderItemModelMock extends BaseModelMock<any> {
  constructor() {
    super([{ ...orderItemStub(), orderId: 1 }]);
  }
}
