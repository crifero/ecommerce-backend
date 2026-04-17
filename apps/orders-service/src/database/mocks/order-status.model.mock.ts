import { BaseModelMock } from './base-model.mock';

export class OrderStatusModelMock extends BaseModelMock<any> {
  constructor() {
    super([
      { id: 1, description: 'pending', isActive: true },
      { id: 2, description: 'delivered', isActive: true },
      { id: 3, description: 'cancelled', isActive: true },
    ]);
  }
}
