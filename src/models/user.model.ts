import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import Haba from './haba.model';

@Table({
  paranoid: true,
  tableName: 'users',
})
export class User extends Model<User> {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  userName!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  displayName!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
    unique: true,
  })
  phoneNumber!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  password!: string;

  @Column({
    allowNull: true,
    type: DataType.TEXT,
    defaultValue: 'Hey, go ahead and goHaba on my account.',
  })
  bio!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
    defaultValue:
      'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
  })
  profileUrl!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  publicId!: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  netIncome!: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  withdrawn!: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  balance!: number;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isVerified!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  verificationCode!: string;

  @HasMany(() => Haba)
  habas!: Haba[];
}

export default User;
