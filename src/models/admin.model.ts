import { Column, DataType, Table, Unique } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model.js';

@Table({ tableName: 'admins', timestamps: true })
export class Admin extends BaseModel<Admin> {
  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare phone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare passwordHash: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;
}
