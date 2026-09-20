import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';
import { User } from './user.model.js';

@Table({ tableName: 'contacts', timestamps: true })
export class Contact extends BaseModel<Contact> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare contactUserId: string;
}
