/**
 * Database Schema Update & Hardcoded Defaults Migration Script
 * 
 * 1. Synchronizes all Sequelize models with { alter: true }
 * 2. Cleanses legacy hardcoded defaults from existing database rows:
 *    - shopkeepers: gstin, email, address
 *    - orders: buyerName, buyerPhone, deliveryAddress, driverName, driverPhone
 *    - support_tickets: buyerName
 * 3. Removes temporary automated test dummy records
 */

const { sequelize, connectDB } = require('../config/database');
const { syncDatabase, Shopkeeper, Order, SupportTicket, Category, Banner } = require('../models');

async function migrateAndClean() {
  console.log('======================================================================');
  console.log('  STARTING DATABASE SCHEMA MIGRATION & HARDCODED DEFAULTS CLEANUP');
  console.log('======================================================================');

  await connectDB();

  // 1. Alter Schema to reflect updated model constraints (allowNull, removed default strings)
  console.log('\n[1/3] Synchronizing schema with { alter: true }...');
  try {
    await syncDatabase({ alter: true });
    console.log('✅ Schema synchronized successfully.');
  } catch (err) {
    console.warn('⚠️ Schema alter warning (SQLite handles column modifications gracefully):', err.message);
  }

  // 2. Cleanse hardcoded default strings from existing rows
  console.log('\n[2/3] Cleansing existing hardcoded dummy values from records...');

  // Shopkeepers
  const [shopkeeperUpdates] = await sequelize.query(`
    UPDATE shopkeepers 
    SET gstin = NULL 
    WHERE gstin = '29AABCU9603R1ZM' OR gstin = ''
  `);
  console.log(`  - Shopkeepers GSTIN cleansed: ${shopkeeperUpdates?.changes || 0} rows`);

  const [emailUpdates] = await sequelize.query(`
    UPDATE shopkeepers 
    SET email = NULL 
    WHERE email = 'procurement@indiranagarfacilities.com' OR email = ''
  `);
  console.log(`  - Shopkeepers email cleansed: ${emailUpdates?.changes || 0} rows`);

  // Orders
  const [buyerNameUpdates] = await sequelize.query(`
    UPDATE orders 
    SET buyerName = NULL 
    WHERE buyerName = 'Indiranagar Facilities Ltd'
  `);
  console.log(`  - Orders buyerName cleansed: ${buyerNameUpdates?.changes || 0} rows`);

  const [buyerPhoneUpdates] = await sequelize.query(`
    UPDATE orders 
    SET buyerPhone = NULL 
    WHERE buyerPhone = '+919876543210'
  `);
  console.log(`  - Orders buyerPhone cleansed: ${buyerPhoneUpdates?.changes || 0} rows`);

  const [deliveryAddrUpdates] = await sequelize.query(`
    UPDATE orders 
    SET deliveryAddress = NULL 
    WHERE deliveryAddress = 'Indiranagar, Bengaluru - 560038'
  `);
  console.log(`  - Orders deliveryAddress cleansed: ${deliveryAddrUpdates?.changes || 0} rows`);

  const [driverNameUpdates] = await sequelize.query(`
    UPDATE orders 
    SET driverName = NULL 
    WHERE driverName = 'Ramesh Kumar (RS Dispatch)'
  `);
  console.log(`  - Orders driverName cleansed: ${driverNameUpdates?.changes || 0} rows`);

  const [driverPhoneUpdates] = await sequelize.query(`
    UPDATE orders 
    SET driverPhone = NULL 
    WHERE driverPhone = '+919876512345'
  `);
  console.log(`  - Orders driverPhone cleansed: ${driverPhoneUpdates?.changes || 0} rows`);

  // Support Tickets
  const [ticketBuyerUpdates] = await sequelize.query(`
    UPDATE support_tickets 
    SET buyerName = NULL 
    WHERE buyerName = 'Indiranagar Facilities Ltd'
  `);
  console.log(`  - Support tickets buyerName cleansed: ${ticketBuyerUpdates?.changes || 0} rows`);

  // 3. Remove temporary automated test records created during API testing
  console.log('\n[3/3] Purging automated test artifacts...');

  const [testOrdersPurged] = await sequelize.query(`
    DELETE FROM orders 
    WHERE orderId LIKE 'RS-TEST-%'
  `);
  console.log(`  - Test dummy orders removed: ${testOrdersPurged?.changes || 0} rows`);

  const [testCatsPurged] = await sequelize.query(`
    DELETE FROM categories 
    WHERE name LIKE 'Automated Test Category%' OR name LIKE 'Automated Test Cat%'
  `);
  console.log(`  - Test dummy categories removed: ${testCatsPurged?.changes || 0} rows`);

  const [testBannersPurged] = await sequelize.query(`
    DELETE FROM banners 
    WHERE title LIKE 'Automated Test%'
  `);
  console.log(`  - Test dummy banners removed: ${testBannersPurged?.changes || 0} rows`);

  console.log('\n======================================================================');
  console.log('✅ DATABASE SCHEMA & RECORDS UPDATE COMPLETED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

migrateAndClean()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
