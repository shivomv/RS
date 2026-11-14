const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryZone = sequelize.define('DeliveryZone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'Uttar Pradesh',
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hubName: {
    type: DataTypes.STRING,
    defaultValue: 'RS Industries Main Warehouse',
  },
  isServiceable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  estimatedDays: {
    type: DataTypes.STRING,
    defaultValue: '1-2 Days',
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  outOfStockSkus: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'delivery_zones',
  timestamps: true,
});

module.exports = DeliveryZone;
