import { Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { Message } from './message.model.js';

export type NetworkGroupType = 'group' | 'channel';

@Table({ tableName: 'network_groups', timestamps: true })
export class NetworkGroup extends BaseModel<NetworkGroup> {
  @Column({ type: DataType.ENUM('group', 'channel'), allowNull: false })
  declare type: NetworkGroupType;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare ownerId: string | null;

  @HasMany(() => Message, { foreignKey: 'groupId' })
  declare messages: Message[];
}
