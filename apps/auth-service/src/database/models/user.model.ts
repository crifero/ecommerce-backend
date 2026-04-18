import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Role } from './role.model';

@Table({ tableName: 'users', schema: 'auth' })
export class User extends Model<User> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ field: 'name', allowNull: false })
  name: string;

  @Column({ field: 'email', allowNull: false, unique: true })
  email: string;

  @Column({ field: 'password', allowNull: false })
  password: string;

  @ForeignKey(() => Role)
  @Column({ field: 'role_id', allowNull: false })
  roleId: number;

  @Column({ field: 'is_active', defaultValue: true })
  isActive: boolean;

  @Column({ field: 'was_deleted', defaultValue: false })
  wasDeleted: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @BelongsTo(() => Role)
  role: Role;
}

export default User;
