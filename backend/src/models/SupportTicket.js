const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticketId: {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueType: {
    type: DataTypes.STRING,
    defaultValue: 'General Query',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'support_tickets',
  timestamps: true,
});

module.exports = SupportTicket;
