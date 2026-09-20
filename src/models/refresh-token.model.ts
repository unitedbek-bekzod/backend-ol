import { Column, DataType, Default, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import type { SubjectType } from '../common/types/jwt-payload.type.js';

@Table({ tableName: 'refresh_tokens', timestamps: true })
export class RefreshToken extends BaseModel<RefreshToken> {
  @Column({ type: DataType.UUID, allowNull: false })
  declare subjectId: string;

  @Column({ type: DataType.ENUM('user', 'admin'), allowNull: false })
  declare subjectType: SubjectType;

  @Column({ type: DataType.STRING, allowNull: false })
  declare tokenHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare revoked: boolean;
}
