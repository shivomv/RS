const express = require('express');
const cors = require('cors');

const productRoutes = require('./modules/product/product.routes');
const shopkeeperRoutes = require('./modules/shopkeeper/shopkeeper.routes');
const orderRoutes = require('./modules/order/order.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'RS Industries Modular API is running' });
});

module.exports = app;
