import { BaseModelMock } from './base-model.mock';
import { allOrdersStub } from '../stubs/order.stub';

export class OrderModelMock extends BaseModelMock<any> {
  constructor() {
    super(
      allOrdersStub().map((o) => ({
        ...o,
        statusId: 1,
        isActive: true,
        wasDeleted: false,
        status: { description: o.status },
        items: o.items,
      })),
    );
  }
}
