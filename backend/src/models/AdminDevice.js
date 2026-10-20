const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminDevice = sequelize.define('AdminDevice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceModel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  platform: {
    type: DataTypes.STRING,
    defaultValue: 'android',
  },
  adminIdentifier: {
    type: DataTypes.STRING,
    defaultValue: 'primary_admin',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastSeenAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'admin_devices',
  timestamps: true,
});

module.exports = AdminDevice;
