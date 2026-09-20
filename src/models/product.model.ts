import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { Business } from './business.model.js';

@Table({ tableName: 'products', timestamps: true })
export class Product extends BaseModel<Product> {
  @ForeignKey(() => Business)
  @Column({ type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @BelongsTo(() => Business, { foreignKey: 'businessId' })
  declare business: any;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: string;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare images: string[];

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare links: string[];
}
