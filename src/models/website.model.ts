import { BelongsTo, Column, DataType, Default, ForeignKey, Table, Unique } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { Business } from './business.model.js';
import { Template } from './template.model.js';

export type WebsiteStatus = 'draft' | 'published';

@Table({ tableName: 'websites', timestamps: true })
export class Website extends BaseModel<Website> {
  @ForeignKey(() => Business)
  @Column({ type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @BelongsTo(() => Business, { foreignKey: 'businessId' })
  declare business: any;

  @ForeignKey(() => Template)
  @Column({ type: DataType.UUID, allowNull: false })
  declare templateId: string;

  @BelongsTo(() => Template, { foreignKey: 'templateId' })
  declare template: any;

  @Unique
  @Column({ type: DataType.STRING, allowNull: true })
  declare publishedSlug: string | null;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare content: Record<string, string>;

  @Default('draft')
  @Column({ type: DataType.ENUM('draft', 'published'), allowNull: false })
  declare status: WebsiteStatus;
}
