import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';

export type TransactionType = 'template_purchase' | 'product_purchase' | 'payout';
export type TransactionStatus = 'pending' | 'success' | 'failed';

@Table({ tableName: 'transactions', timestamps: true })
export class Transaction extends BaseModel<Transaction> {
  @Column({ type: DataType.UUID, allowNull: false })
  declare fromUserId: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare toBusinessId: string | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare toTemplateId: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare amount: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare commission: string;

  @Column({ type: DataType.ENUM('template_purchase', 'product_purchase', 'payout'), allowNull: false })
  declare type: TransactionType;

  @Column({
    type: DataType.ENUM('pending', 'success', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: TransactionStatus;
}
