import { Column, DataType, Default, HasMany, Table, Unique } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { Business } from './business.model.js';

export type UserRole = 'user' | 'programmist';

@Table({ tableName: 'users', timestamps: true })
export class User extends BaseModel<User> {
  @Unique
  @Column({ type: DataType.STRING, allowNull: true })
  declare googleId: string | null;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare avatarUrl: string | null;

  @Default('user')
  @Column({ type: DataType.ENUM('user', 'programmist'), allowNull: false })
  declare role: UserRole;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare followersCount: number;

  @Default('active')
  @Column({ type: DataType.ENUM('active', 'blocked'), allowNull: false })
  declare status: 'active' | 'blocked';

  @Column({ type: DataType.JSONB, allowNull: true })
  declare portfolio: Record<string, unknown> | null;

  @HasMany(() => Business, { foreignKey: 'ownerId' })
  declare businesses: Business[];
}
