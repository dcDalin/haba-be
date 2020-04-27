module.exports.up = (queryInterface, DataTypes) => {
  return queryInterface.createTable(
    'userTransactions',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        references: {
          key: 'id',
          model: 'users',
        },
        type: DataTypes.INTEGER,
      },
      transactionCode: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      amount: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      serviceFee: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      transactionType: {
        allowNull: false,
        type: DataTypes.ENUM('HABA', 'WITHDRAW'),
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
  );
};

module.exports.down = (queryInterface) => queryInterface.dropTable('habas');
