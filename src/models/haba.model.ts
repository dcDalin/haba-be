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
  tableName: 'habas',
})
export class Haba extends Model<Haba> {
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
  fromNumber!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  fromName!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  fromMessage!: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
  })
  fromIsPrivate!: boolean;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  fromAmount!: number;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  reply!: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      // @ts-ignore
      const date = this.dataValues.createdAt;
      return moment(date).fromNow();
    },
  })
  fromNow!: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      // @ts-ignore
      const date = this.dataValues.updatedAt;
      return moment(date).fromNow();
    },
  })
  fromUpdate!: string;

  @BelongsTo(() => User)
  user!: User;
}

export default Haba;
