const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shopkeeperId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  facilityName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fullAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: 'Bengaluru',
  },
  pincode: {
    type: DataTypes.STRING,
    defaultValue: '560038',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'addresses',
  timestamps: true,
});

module.exports = Address;
