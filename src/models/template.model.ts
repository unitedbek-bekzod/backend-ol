import { BelongsTo, Column, DataType, Default, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { User } from './user.model.js';

export type TemplateStatus = 'pending' | 'approved' | 'rejected';

/**
 * Which frontend renderer component displays this template. The hackathon MVP ships
 * exactly 4 real renderer components on the frontend, so every template — including
 * user-uploaded ones — is mapped onto one of these 4 layouts.
 */
export type TemplateKey = 'landing' | 'portfolio' | 'store' | 'course' | 'coffee';

export interface TemplatePlaceholder {
  key: string;
  type: 'text' | 'color';
  max_length?: number;
}

@Table({ tableName: 'templates', timestamps: true })
export class Template extends BaseModel<Template> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare authorId: string | null;

  @BelongsTo(() => User, { foreignKey: 'authorId' })
  declare author: any;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare category: string;

  @Default('landing')
  @Column({ type: DataType.ENUM('landing', 'portfolio', 'store', 'course', 'coffee'), allowNull: false })
  declare templateKey: TemplateKey;

  @Default(0)
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare previewUrl: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare aiCompatible: boolean;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare blocks: TemplatePlaceholder[];

  @Default('approved')
  @Column({ type: DataType.ENUM('pending', 'approved', 'rejected'), allowNull: false })
  declare status: TemplateStatus;
}
