const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'RS Admin',
  },
  pin: {
    type: DataTypes.STRING,
    defaultValue: '9999',
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'ADMIN', // 'SUPERADMIN' | 'ADMIN'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'admin_users',
  timestamps: true,
});

module.exports = AdminUser;
