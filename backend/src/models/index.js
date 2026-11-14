const { sequelize } = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const ProductBundle = require('./ProductBundle');
const Banner = require('./Banner');
const Shopkeeper = require('./Shopkeeper');
const Order = require('./Order');
const SupportTicket = require('./SupportTicket');
const Cart = require('./Cart');
const Company = require('./Company');
const Address = require('./Address');
const Ledger = require('./Ledger');
const InventoryBatch = require('./InventoryBatch');
const Review = require('./Review');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const AdminDevice = require('./AdminDevice');
const AdminUser = require('./AdminUser');
const DeliveryZone = require('./DeliveryZone');

// ── Define Associations ──────────────────────────────────────────────
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Product.hasMany(ProductBundle, { foreignKey: 'productId', as: 'bundles', onDelete: 'CASCADE' });
ProductBundle.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Shopkeeper.hasMany(Order, { foreignKey: 'shopkeeperId', as: 'orders' });
Order.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

Shopkeeper.hasOne(Cart, { foreignKey: 'shopkeeperId', as: 'cart' });
Cart.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

Shopkeeper.hasMany(SupportTicket, { foreignKey: 'shopkeeperId', as: 'tickets' });
SupportTicket.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

Shopkeeper.hasMany(Address, { foreignKey: 'shopkeeperId', as: 'addresses' });
Address.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

Shopkeeper.hasMany(Ledger, { foreignKey: 'shopkeeperId', as: 'ledgers' });
Ledger.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

Product.hasMany(InventoryBatch, { foreignKey: 'productId', as: 'batches' });
InventoryBatch.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Shopkeeper.hasMany(Notification, { foreignKey: 'shopkeeperId', as: 'notifications' });
Notification.belongsTo(Shopkeeper, { foreignKey: 'shopkeeperId', as: 'shopkeeper' });

async function seedDefaultSuperAdmin() {
  try {
    const { Op } = require('sequelize');
    const email = process.env.SUPERADMIN_EMAIL;
    const mobile = process.env.SUPERADMIN_MOBILE;

    if (!email && !mobile) {
      return;
    }

    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (mobile) whereConditions.push({ mobile });

    let superAdmin = await AdminUser.findOne({
      where: {
        [Op.or]: whereConditions,
      },
    });

    if (!superAdmin) {
      await AdminUser.create({
        name: process.env.SUPERADMIN_NAME || 'Super Admin',
        email,
        mobile,
        pin: process.env.SUPERADMIN_PIN || null,
        role: 'SUPERADMIN',
        isActive: true,
      });
      console.log(`✅ [Database] Seeded Super Admin from env: ${email || mobile}`);
    } else {
      await superAdmin.update({
        ...(email && { email }),
        ...(mobile && { mobile }),
        role: 'SUPERADMIN',
        isActive: true,
      });
      console.log(`✅ [Database] Synchronized Super Admin from env: ${email || mobile}`);
    }
  } catch (e) {
    console.warn('[Database] Super Admin seed check:', e.message);
  }
}

async function ensureColumns() {
  const qi = sequelize.getQueryInterface();
  const tables = {
    shopkeepers: [
      { name: 'googleId', type: 'VARCHAR(255)' },
      { name: 'avatarUrl', type: 'TEXT' },
    ],
    orders: [
      { name: 'statusHistory', type: 'JSON' },
      { name: 'cancellationReason', type: 'VARCHAR(255)' },
    ],
    support_tickets: [
      { name: 'replies', type: 'JSON' },
    ],
    admin_users: [
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'googleId', type: 'VARCHAR(255)' },
      { name: 'avatarUrl', type: 'TEXT' },
    ],
  };

  for (const [table, cols] of Object.entries(tables)) {
    try {
      const desc = await qi.describeTable(table).catch(() => null);
      if (desc) {
        for (const col of cols) {
          if (!desc[col.name]) {
            await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type};`);
            console.log(`✅ [Database] Added missing column ${col.name} to ${table}`);
          }
        }
      }
    } catch (_) {}
  }
}

/**
 * Synchronize all database tables with current models
 * @param {Object} options - Sequelize sync options
 */
async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options);
    await ensureColumns();
    console.log('✅ [Database] All models synchronized successfully.');
    await seedDefaultSuperAdmin();
  } catch (error) {
    console.error('❌ [Database] Synchronization failed:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  Category,
  Product,
  ProductBundle,
  Banner,
  Shopkeeper,
  Order,
  SupportTicket,
  Cart,
  Company,
  Address,
  Ledger,
  InventoryBatch,
  Review,
  Notification,
  AuditLog,
  AdminDevice,
  AdminUser,
  DeliveryZone,
  syncDatabase,
};
