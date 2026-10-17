const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductBundle = sequelize.define('ProductBundle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bundleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mrp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'product_bundles',
  timestamps: true,
});

module.exports = ProductBundle;
