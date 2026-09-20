import { Column, DataType, Default, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { NetworkGroup } from './network-group.model.js';
import { User } from './user.model.js';

@Table({ tableName: 'group_members', timestamps: true })
export class GroupMember extends BaseModel<GroupMember> {
  @ForeignKey(() => NetworkGroup)
  @Column({ type: DataType.UUID, allowNull: false })
  declare groupId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Default('member')
  @Column({ type: DataType.STRING, allowNull: false })
  declare role: string;
}
