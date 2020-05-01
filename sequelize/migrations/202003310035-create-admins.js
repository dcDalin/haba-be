module.exports.up = (queryInterface, DataTypes, done) => {
  return queryInterface
    .createTable(
      'admins',
      {
        phoneNumber: {
          allowNull: false,
          type: DataTypes.STRING,
          primaryKey: true,
        },
        name: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        password: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        isVerified: {
          allowNull: false,
          type: DataTypes.BOOLEAN,
        },
        verificationCode: {
          allowNull: true,
          type: DataTypes.STRING,
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
        charset: 'utf8',
      }
    )
    .then(function () {
      queryInterface.sequelize.query(`
				INSERT INTO admins
					("phoneNumber", "name", "password", "isVerified", "netIncome", "withdrawn", "balance", "createdAt", "updatedAt") 
				VALUES
					('254715973838', 'Dalin Oluoch', 'password', FALSE, 0, 0, 0, 'NOW()', 'NOW()'),
					('254728600789', 'Benard Odoyo', 'password', FALSE, 0, 0, 0, 'NOW()', 'NOW()'),
					('254703625710', 'Kennedy Simiyu', 'password', FALSE, 0, 0, 0, 'NOW()', 'NOW()');
			`);
      done();
    });
};

module.exports.down = (queryInterface) => queryInterface.dropTable('users');
