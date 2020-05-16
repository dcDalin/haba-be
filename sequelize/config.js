const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports.development = {
  dialect: 'postgres',
  seederStorage: 'sequelize',
  url: process.env.DATABASE_URL,
};

module.exports.staging = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
};

module.exports.production = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
};
