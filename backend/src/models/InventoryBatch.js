const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryBatch = sequelize.define('InventoryBatch', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'inventory_batches',
  timestamps: true,
});

module.exports = InventoryBatch;
