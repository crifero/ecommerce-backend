import { AutoMap } from '@automapper/classes';
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { OrderStatus } from './order-status.model';
import { OrderItem } from './order-item.model';

@Table({ tableName: 'orders', schema: 'orders' })
export class Order extends Model<Order> {
  @AutoMap()
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @AutoMap()
  @Column({ field: 'user_id', allowNull: false })
  userId: number;

  @AutoMap()
  @ForeignKey(() => OrderStatus)
  @Column({ field: 'status_id', defaultValue: 1 })
  statusId: number;

  @AutoMap()
  @Column({ field: 'total', allowNull: false, defaultValue: 0 })
  total: number;

  @AutoMap()
  @Column({ field: 'observations', allowNull: true })
  observations: string;

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

  @BelongsTo(() => OrderStatus)
  status: OrderStatus;

  @HasMany(() => OrderItem)
  items: OrderItem[];
}

export default Order;
