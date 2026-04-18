import {
  Column,
  CreatedAt,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'roles', schema: 'auth' })
export class Role extends Model<Role> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ field: 'name', allowNull: false, unique: true })
  name: string;

  @Column({ field: 'is_active', defaultValue: true })
  isActive: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => User)
  users: User[];
}

export default Role;
