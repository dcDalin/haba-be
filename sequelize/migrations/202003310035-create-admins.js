module.exports.up = (queryInterface, DataTypes, done) => {
	return queryInterface
		.createTable(
			"admins",
			{
				email: {
					allowNull: false,
					type: DataTypes.STRING,
					primaryKey: true,
				},
				name: {
					allowNull: false,
					type: DataTypes.STRING,
				},
				phoneNumber: {
					allowNull: false,
					type: DataTypes.STRING,
					unique: true,
				},
				password: {
					allowNull: false,
					type: DataTypes.STRING,
				},
				isVerified: {
					allowNull: false,
					type: DataTypes.BOOLEAN,
				},
				netIncome: {
					allowNull: false,
					type: DataTypes.FLOAT,
				},
				withdrawn: {
					allowNull: false,
					type: DataTypes.FLOAT,
				},
				balance: {
					allowNull: false,
					type: DataTypes.FLOAT,
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
				},
				deletedAt: {
					allowNull: true,
					type: DataTypes.DATE,
				},
			},
			{
				charset: "utf8",
			}
		)
		.then(function () {
			queryInterface.sequelize.query(`
				INSERT INTO admins
					("email", "name", "phoneNumber", "password", "isVerified", "netIncome", "withdrawn", "balance", "createdAt", "updatedAt") 
				VALUES
					('mcdalinoluoch@gmail.com', 'Dalin Oluoch', '254715973838', 'password', TRUE, 0, 0, 0, 'NOW()', 'NOW()'),
					('benardo016@gmail.com', 'Benard Odoyo', '254728600789', 'password', TRUE, 0, 0, 0, 'NOW()', 'NOW()');
			`);
			done();
		});
};

module.exports.down = (queryInterface) => queryInterface.dropTable("users");
