"use strict";
module.exports = {
	up: function (queryInterface, Sequelize) {
		return queryInterface.createTable(
			"habas",
			{
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER,
				},
				userId: {
					allowNull: false,
					references: {
						key: "id",
						model: "users",
					},
					type: Sequelize.INTEGER,
				},
				mpesaCode: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				fromNumber: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				fromName: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				fromMessage: {
					allowNull: true,
					type: Sequelize.STRING,
				},
				fromIsPrivate: {
					allowNull: false,
					type: Sequelize.BOOLEAN,
				},
				fromAmount: {
					allowNull: false,
					type: Sequelize.FLOAT,
				},
				reply: {
					allowNull: true,
					type: Sequelize.STRING,
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
	down: (queryInterface) => queryInterface.dropTable("habas"),
};
