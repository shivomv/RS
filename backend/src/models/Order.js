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
    defaultValue: 'Indiranagar Facilities Ltd',
  },
  buyerPhone: {
    type: DataTypes.STRING,
    defaultValue: '+919876543210',
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
    defaultValue: 'Google Pay (Tez UPI)',
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
    defaultValue: 'Indiranagar, Bengaluru - 560038',
  },
  driverName: {
    type: DataTypes.STRING,
    defaultValue: 'Ramesh Kumar (RS Dispatch)',
  },
  driverPhone: {
    type: DataTypes.STRING,
    defaultValue: '+919876512345',
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
