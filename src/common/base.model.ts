import { Column, DataType, Default, Model } from 'sequelize-typescript';

export abstract class BaseModel<
  T extends object = any,
  C extends object = any,
> extends Model<T, C> {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;
}
