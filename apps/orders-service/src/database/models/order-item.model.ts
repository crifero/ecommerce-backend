import { AutoMap } from '@automapper/classes';
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Order } from './order.model';

@Table({ tableName: 'order_items', schema: 'orders' })
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

  @AutoMap()
  @Column({ field: 'is_active', defaultValue: true })
  isActive: boolean;

  @AutoMap()
  @Column({ field: 'was_deleted', defaultValue: false })
  wasDeleted: boolean;

  @AutoMap()
  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @AutoMap()
  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @BelongsTo(() => Order)
  order: Order;
}

export default OrderItem;
