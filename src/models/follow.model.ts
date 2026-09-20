import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { User } from './user.model.js';

@Table({ tableName: 'follows', timestamps: true })
export class Follow extends BaseModel<Follow> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare followerId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare followingId: string;
}
