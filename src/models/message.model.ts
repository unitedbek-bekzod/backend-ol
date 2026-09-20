import { BelongsTo, Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { NetworkGroup } from './network-group.model.js';
import { User } from './user.model.js';

@Table({ tableName: 'messages', timestamps: true, updatedAt: false })
export class Message extends BaseModel<Message> {
  @ForeignKey(() => NetworkGroup)
  @Column({ type: DataType.UUID, allowNull: false })
  declare groupId: string;

  @BelongsTo(() => NetworkGroup, { foreignKey: 'groupId' })
  declare group: any;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare senderId: string;

  @BelongsTo(() => User, { foreignKey: 'senderId' })
  declare sender: any;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;
}
