const { sequelize } = require('../config/database');
const { Shopkeeper } = require('../models');

async function fixShopkeepers() {
  try {
    const qi = sequelize.getQueryInterface();
    const desc = await qi.describeTable('shopkeepers');
    console.log('Current shopkeepers columns:', desc);

    if (desc.mobile && desc.mobile.allowNull === false) {
      console.log('Mobile is NOT NULL. Migrating table in SQLite to allow NULL mobile...');
      await sequelize.query('PRAGMA foreign_keys=off;');
      await sequelize.query('BEGIN TRANSACTION;');

      // 1. Create temporary new table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS shopkeepers_migrated (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          mobile VARCHAR(255),
          shopName VARCHAR(255) DEFAULT 'Retail Store',
          avatarUrl TEXT,
          address TEXT,
          gstin VARCHAR(255),
          email VARCHAR(255),
          googleId VARCHAR(255),
          role VARCHAR(255) DEFAULT 'buyer',
          outstandingBalance FLOAT DEFAULT 0,
          creditLimit FLOAT DEFAULT 100000,
          isApproved TINYINT(1) DEFAULT 1,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        );
      `);

      // 2. Select matching available columns
      const colsInOld = Object.keys(desc);
      const hasAvatar = colsInOld.includes('avatarUrl');
      const hasGoogle = colsInOld.includes('googleId');

      const selectFields = [
        'id', 'name', 'mobile', 'shopName',
        hasAvatar ? 'avatarUrl' : 'NULL AS avatarUrl',
        'address', 'gstin', 'email',
        hasGoogle ? 'googleId' : 'NULL AS googleId',
        'role', 'outstandingBalance', 'creditLimit', 'isApproved',
        'createdAt', 'updatedAt'
      ].join(', ');

      await sequelize.query(`
        INSERT INTO shopkeepers_migrated (
          id, name, mobile, shopName, avatarUrl, address, gstin, email, googleId, role, outstandingBalance, creditLimit, isApproved, createdAt, updatedAt
        ) SELECT ${selectFields} FROM shopkeepers;
      `);

      await sequelize.query('DROP TABLE shopkeepers;');
      await sequelize.query('ALTER TABLE shopkeepers_migrated RENAME TO shopkeepers;');
      await sequelize.query('COMMIT;');
      await sequelize.query('PRAGMA foreign_keys=on;');
      console.log('✅ [Migration] shopkeepers table migrated successfully! mobile is now nullable.');
    } else {
      console.log('✅ [Check] mobile is already nullable in shopkeepers.');
    }

    // Verify insert without mobile
    const test = await Shopkeeper.create({
      name: 'Google Verification Partner',
      email: `verify_${Date.now()}@gmail.com`,
      googleId: `gid_${Date.now()}`,
    });
    console.log('✅ Successfully created shopkeeper without mobile! ID:', test.id);
    await test.destroy();
    console.log('✅ Cleaned up test record.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    try { await sequelize.query('ROLLBACK;'); } catch (_) {}
    process.exit(1);
  }
  process.exit(0);
}

fixShopkeepers();
