const express = require('express');
const cors = require('cors');

const productRoutes = require('./modules/product/product.routes');
const shopkeeperRoutes = require('./modules/shopkeeper/shopkeeper.routes');
const orderRoutes = require('./modules/order/order.routes');
const authRoutes = require('./modules/auth/auth.routes');
const categoryRoutes = require('./modules/category/category.routes');
const bannerRoutes = require('./modules/banner/banner.routes');
const ledgerRoutes = require('./modules/ledger/ledger.routes');
const ticketRoutes = require('./modules/ticket/ticket.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes for All Collections
app.use('/api/products', productRoutes);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/tickets', ticketRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'RS Industries Enterprise 14-Collection API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'online', message: 'RS Industries API is running' });
});

module.exports = app;
