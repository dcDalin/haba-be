module.exports.up = (queryInterface, DataTypes) => {
	return queryInterface.createTable(
		"adminTransactions",
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			adminEmail: {
				allowNull: false,
				references: {
					key: "email",
					model: "admins"
				},
				type: DataTypes.STRING
			},
			amount: {
				allowNull: false,
				type: DataTypes.FLOAT
			},
			transactionType: {
				allowNull: false,
				type: DataTypes.ENUM("SERVICE FEE", "WITHDRAW")
			},
			balance: {
				allowNull: false,
				type: DataTypes.FLOAT
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE
			},
			deletedAt: {
				allowNull: true,
				type: DataTypes.DATE
			}
		},
		{
			charset: "utf8"
		}
	);
};

module.exports.down = (queryInterface) => queryInterface.dropTable("habas");
