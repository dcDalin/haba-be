import { Sequelize } from "sequelize-typescript";
import accessEnv from "../helpers/accessEnv";
import models from "../models";

const DATABASE_URL = accessEnv("DATABASE_URL");

const sequelize = new Sequelize(DATABASE_URL, {
	dialectOptions: {
		charset: "utf8",
		multipleStatements: true,
	},
	logging: console.log,
	models,
});

export default sequelize;
