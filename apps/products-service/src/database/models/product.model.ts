import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'products', schema: 'products' })
export class Product extends Model<Product> {
  @AutoMap()
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @AutoMap()
  @Column({ field: 'name', allowNull: false })
  name: string;

  @AutoMap()
  @Column({ field: 'description', allowNull: true })
  description: string;

  @AutoMap()
  @Column({ field: 'price', allowNull: false })
  price: number;

  @AutoMap()
  @Column({ field: 'stock', defaultValue: 0 })
  stock: number;

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
}

export default Product;
