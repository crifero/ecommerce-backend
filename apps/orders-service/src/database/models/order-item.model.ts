import { AutoMap } from '@automapper/classes';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from './order.model';

@Table({ tableName: 'order_items', schema: 'orders', timestamps: false })
export class OrderItem extends Model<OrderItem> {
  @AutoMap()
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @AutoMap()
  @ForeignKey(() => Order)
  @Column({ field: 'order_id' })
  orderId: number;

  @AutoMap()
  @Column({ field: 'product_id' })
  productId: number;

  @AutoMap()
  @Column({ field: 'product_name', allowNull: false })
  productName: string;

  @AutoMap()
  @Column({ field: 'product_price', allowNull: false })
  productPrice: number;

  @AutoMap()
  @Column({ field: 'quantity', allowNull: false })
  quantity: number;

  @AutoMap()
  @Column({ field: 'subtotal', allowNull: false })
  subtotal: number;

  @BelongsTo(() => Order)
  order: Order;
}

export default OrderItem;
