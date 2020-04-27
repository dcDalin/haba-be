import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  paranoid: true,
  tableName: 'admins',
})
export class Admin extends Model<Admin> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.STRING,
  })
  phoneNumber!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  name!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  password!: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
  })
  isVerified!: boolean;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  netIncome!: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  withdrawn!: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  balance!: number;
}

export default Admin;
