const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shopkeeperId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  buyerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  buyerSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  deliveryAddressSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  financialSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  gstAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'Cash on Delivery (COD)',
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  driverName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  driverPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
