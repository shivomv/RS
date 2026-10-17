const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: '127.0.0.1',
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
});

module.exports = AuditLog;
