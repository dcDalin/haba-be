import {
	Column,
	DataType,
	Model,
	ForeignKey,
	BelongsTo,
	Table,
} from "sequelize-typescript";
import Admin from "./admin.model";

@Table({
	defaultScope: {
		attributes: { exclude: ["deletedAt"] },
	},
	paranoid: true,
	tableName: "adminTransactions",
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
		type: DataType.STRING,
	})
	@ForeignKey(() => Admin)
	adminPhoneNumber!: string;

	@Column({
		allowNull: false,
		type: DataType.FLOAT,
	})
	amount!: string;

	@Column({
		allowNull: false,
		type: DataType.ENUM("SERVICE FEE", "WITHDRAW"),
	})
	transactionType!: string;

	@Column({
		allowNull: false,
		type: DataType.FLOAT,
	})
	balance!: string;

	@BelongsTo(() => Admin)
	admin!: Admin;
}

export default Haba;
