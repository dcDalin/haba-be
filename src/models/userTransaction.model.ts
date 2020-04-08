import {
	Column,
	DataType,
	Model,
	ForeignKey,
	BelongsTo,
	Table
} from "sequelize-typescript";
import User from "./user.model";

@Table({
	defaultScope: {
		attributes: { exclude: ["deletedAt"] }
	},
	paranoid: true,
	tableName: "userTransactions"
})
export class Haba extends Model<Haba> {
	@Column({
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataType.INTEGER
	})
	id!: string;

	@Column({
		allowNull: false,
		type: DataType.INTEGER
	})
	@ForeignKey(() => User)
	userId!: string;

	@Column({
		allowNull: false,
		type: DataType.FLOAT
	})
	amount!: string;

	@Column({
		allowNull: false,
		type: DataType.FLOAT
	})
	serviceFee!: string;

	@Column({
		allowNull: false,
		type: DataType.ENUM("HABA", "WITHDRAW")
	})
	transactionType!: string;

	@Column({
		allowNull: false,
		type: DataType.FLOAT
	})
	balance!: string;

	@BelongsTo(() => User)
	user!: User;
}

export default Haba;
