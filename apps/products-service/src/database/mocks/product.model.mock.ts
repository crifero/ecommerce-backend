import { BaseModelMock } from './base-model.mock';
import { Product } from '../models/product.model';
import { allProductsStub } from '../stubs/product.stub';

export class ProductModelMock extends BaseModelMock<Product> {
  constructor() {
    super(allProductsStub() as unknown as Product[]);
  }
}
