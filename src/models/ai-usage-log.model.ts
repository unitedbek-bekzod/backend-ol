import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';

@Table({ tableName: 'ai_usage_logs', timestamps: true, updatedAt: false })
export class AiUsageLog extends BaseModel<AiUsageLog> {
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare templateId: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare tokensUsed: number;
}
