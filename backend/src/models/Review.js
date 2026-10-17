const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shopkeeperId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5,
  },
  comment: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'reviews',
  timestamps: true,
});

module.exports = Review;
