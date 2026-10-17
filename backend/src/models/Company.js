const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'RS Industries',
  },
  aboutDescription: {
    type: DataTypes.TEXT,
    defaultValue: 'Leading wholesale B2B marketplace for industrial supplies.',
  },
  email: {
    type: DataTypes.STRING,
    defaultValue: 'hello@rsindustries.com',
  },
  contactPhone: {
    type: DataTypes.STRING,
    defaultValue: '+91-80-XXXX-XXXX',
  },
  alternatePhone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  contactPerson: {
    type: DataTypes.STRING,
    defaultValue: 'Business Development Team',
  },
  officeAddress: {
    type: DataTypes.JSON,
    defaultValue: {
      streetAddress: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
  },
  socialMedia: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  businessHours: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'companies',
  timestamps: true,
});

module.exports = Company;
