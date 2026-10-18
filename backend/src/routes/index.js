const express = require('express');
const router = express.Router();

// Import All 15 Domain Module Routes
const authRoutes = require('../modules/auth/auth.routes');
const shopkeeperRoutes = require('../modules/shopkeeper/shopkeeper.routes');
const productRoutes = require('../modules/product/product.routes');
const categoryRoutes = require('../modules/category/category.routes');
const bannerRoutes = require('../modules/banner/banner.routes');
const cartRoutes = require('../modules/cart/cart.routes');
const orderRoutes = require('../modules/order/order.routes');
const ledgerRoutes = require('../modules/ledger/ledger.routes');
const ticketRoutes = require('../modules/ticket/ticket.routes');
const addressRoutes = require('../modules/address/address.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const reviewRoutes = require('../modules/review/review.routes');
const notificationRoutes = require('../modules/notification/notification.routes');
const auditRoutes = require('../modules/audit/audit.routes');
const companyRoutes = require('../modules/company/company.routes');
const uploadRoutes = require('../modules/upload/upload.routes');

// Mount Domain Routes under Master API Router
router.use('/auth', authRoutes);
router.use('/shopkeepers', shopkeeperRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/ledgers', ledgerRoutes);
router.use('/tickets', ticketRoutes);
router.use('/addresses', addressRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audits', auditRoutes);
router.use('/company', companyRoutes);
router.use('/upload', uploadRoutes);

// API Information & Route Registry Index
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RS Industries Master API Router v2.0.0 Active',
    correlationId: req.correlationId,
    modulesCount: 16,
    availableRoutes: [
      '/api/auth',
      '/api/shopkeepers',
      '/api/products',
      '/api/categories',
      '/api/banners',
      '/api/cart',
      '/api/orders',
      '/api/ledgers',
      '/api/tickets',
      '/api/addresses',
      '/api/inventory',
      '/api/reviews',
      '/api/notifications',
      '/api/audits',
      '/api/company'
    ]
  });
});

module.exports = router;
