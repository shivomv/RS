const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'sqlite') {
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.SQLITE_STORAGE || path.join(dataDir, 'database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'rs_industries',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
} else {
  throw new Error(`Unsupported DB_DIALECT "${dialect}". Supported: sqlite, mysql`);
}

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`✅ [Database] Connected successfully via [${dialect.toUpperCase()}]`);
    return sequelize;
  } catch (error) {
    console.error(`❌ [Database] Connection error (${dialect}):`, error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  connectDB,
  dialect,
};
