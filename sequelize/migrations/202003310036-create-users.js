"use strict";
module.exports = {
	up: function (queryInterface, Sequelize) {
		return queryInterface.createTable(
			"users",
			{
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER,
				},
				userName: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				displayName: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				email: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				phoneNumber: {
					allowNull: true,
					type: Sequelize.STRING,
					unique: true,
				},
				password: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				bio: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				profileUrl: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				netIncome: {
					allowNull: false,
					type: Sequelize.FLOAT,
				},
				withdrawn: {
					allowNull: false,
					type: Sequelize.FLOAT,
				},
				balance: {
					allowNull: false,
					type: Sequelize.FLOAT,
				},
				createdAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
				updatedAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
				deletedAt: {
					allowNull: true,
					type: Sequelize.DATE,
				},
			},
			{
				charset: "utf8",
			}
		);
	},
	down: (queryInterface) => queryInterface.dropTable("users"),
};
