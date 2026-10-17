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

/**
 * Synchronize all database tables with current models
 * @param {Object} options - Sequelize sync options
 */
async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options);
    console.log('✅ [Database] All models synchronized successfully.');
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
  syncDatabase,
};
