import { BelongsTo, Column, DataType, ForeignKey, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { User } from './user.model.js';
import { Product } from './product.model.js';
import { Website } from './website.model.js';

@Table({ tableName: 'businesses', timestamps: true })
export class Business extends BaseModel<Business> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare ownerId: string;

  @BelongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: any;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare logo: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @HasMany(() => Product, { foreignKey: 'businessId' })
  declare products: Product[];

  @HasMany(() => Website, { foreignKey: 'businessId' })
  declare websites: Website[];
}
