const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shopkeeperId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  couponCode: {
    type: DataTypes.STRING,
    defaultValue: 'RSBULK100',
  },
  gstRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'carts',
  timestamps: true,
});

module.exports = Cart;
