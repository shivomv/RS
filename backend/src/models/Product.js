const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    defaultValue: 'RS Pro',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categorySlug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  mrp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING,
    defaultValue: 'Wholesale',
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  baseImages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
