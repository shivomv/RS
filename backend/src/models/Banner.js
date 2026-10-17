const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING,
    defaultValue: 'Direct from Factory',
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 45,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  targetCategory: {
    type: DataTypes.STRING,
    defaultValue: 'Floor Cleaners',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'banners',
  timestamps: true,
});

module.exports = Banner;
