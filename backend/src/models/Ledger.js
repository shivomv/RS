const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ledger = sequelize.define('Ledger', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shopkeeperId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'DEBIT',
  },
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  runningBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  tableName: 'ledgers',
  timestamps: true,
});

module.exports = Ledger;
