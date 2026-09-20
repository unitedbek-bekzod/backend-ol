import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { User } from './user.model.js';
import { Template } from './template.model.js';
import { Transaction } from './transaction.model.js';

@Table({ tableName: 'template_purchases', timestamps: true })
export class TemplatePurchase extends BaseModel<TemplatePurchase> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  declare user: any;

  @ForeignKey(() => Template)
  @Column({ type: DataType.UUID, allowNull: false })
  declare templateId: string;

  @BelongsTo(() => Template, { foreignKey: 'templateId' })
  declare template: any;

  @ForeignKey(() => Transaction)
  @Column({ type: DataType.UUID, allowNull: false })
  declare transactionId: string;
}
