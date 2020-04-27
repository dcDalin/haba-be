import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
} from 'sequelize-typescript';
import moment from 'moment';
import User from './user.model';

@Table({
  defaultScope: {
    attributes: { exclude: ['deletedAt'] },
  },
  paranoid: true,
  tableName: 'userTransactions',
})
export class UserTransaction extends Model<UserTransaction> {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id!: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  @ForeignKey(() => User)
  userId!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  transactionCode!: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  amount!: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  serviceFee!: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM('HABA', 'WITHDRAW'),
  })
  transactionType!: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  balance!: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      // @ts-ignore
      const date = this.dataValues.createdAt;
      return moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
    },
  })
  date!: string;

  @BelongsTo(() => User)
  user!: User;
}

export default UserTransaction;
