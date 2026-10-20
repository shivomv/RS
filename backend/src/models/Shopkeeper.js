const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shopkeeper = sequelize.define('Shopkeeper', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gstin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'buyer',
  },
  outstandingBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  creditLimit: {
    type: DataTypes.FLOAT,
    defaultValue: 100000,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'shopkeepers',
  timestamps: true,
});

module.exports = Shopkeeper;
