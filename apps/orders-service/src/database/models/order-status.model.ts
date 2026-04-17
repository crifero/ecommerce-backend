import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreatedAt,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Order } from './order.model';

@Table({ tableName: 'order_statuses', schema: 'orders' })
export class OrderStatus extends Model<OrderStatus> {
  @AutoMap()
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @AutoMap()
  @Column({ field: 'description', allowNull: false })
  description: string;

  @AutoMap()
  @Column({ field: 'is_active', defaultValue: true })
  isActive: boolean;

  @AutoMap()
  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @AutoMap()
  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Order)
  orders: Order[];
}

export default OrderStatus;
