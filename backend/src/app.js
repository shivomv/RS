const express = require('express');
const cors = require('cors');
const { connectDB, dialect, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');

// Import Master API Router
const apiRoutes = require('./routes');

const app = express();

// Request Correlation ID & Middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database Auto-Connection Middleware
let isDbInitialized = false;
async function ensureDbConnected(req, res, next) {
  if (!isDbInitialized) {
    try {
      await connectDB();
      await syncDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.error('❌ [DB Middleware] Database Connection Error:', err.message);
      return res.status(503).json({
        success: false,
        error: `Database Connection Failed: ${err.message}`,
        code: 'DB_CONNECTION_ERROR',
        correlationId: req.correlationId,
      });
    }
  }
  next();
}

app.use(ensureDbConnected);

// Mount Master API Router for all domain modules under /api
app.use('/api', apiRoutes);

// Health Check Helper
const getHealthStatus = async (req) => {
  let isConnected = false;
  try {
    await sequelize.authenticate();
    isConnected = true;
  } catch (_) {
    isConnected = false;
  }

  return {
    success: isConnected,
    message: 'RS Industries API Engine is running',
    version: '2.0.0',
    database: {
      dialect: dialect.toUpperCase(),
      connected: isConnected,
      storage: dialect === 'sqlite' ? 'backend/data/database.sqlite' : undefined,
    },
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  };
};

// Health Check Routes
app.get('/', async (req, res) => {
  const health = await getHealthStatus(req);
  res.status(health.success ? 200 : 503).json(health);
});

app.get('/health', async (req, res) => {
  const health = await getHealthStatus(req);
  res.status(health.success ? 200 : 503).json(health);
});

// 404 Catch-All Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
    correlationId: req.correlationId,
  });
});

// Centralized Enterprise Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error] [${req.correlationId}] ${err.stack || err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    correlationId: req.correlationId,
  });
});

module.exports = app;
