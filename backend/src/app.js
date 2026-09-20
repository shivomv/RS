const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serverless-Compatible MongoDB Auto-Connection Middleware
let isConnecting = null;

async function ensureDbConnected(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  const MONGO_URI = process.env.MONGO_URI;
  try {
    if (!isConnecting) {
      isConnecting = mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
    await isConnecting;
    isConnecting = null;
    next();
  } catch (err) {
    isConnecting = null;
    console.error('❌ MongoDB Connection Error in Middleware:', err.message);
    next();
  }
}

app.use(ensureDbConnected);

// Mount Master API Router for all 15 domain modules under /api
app.use('/api', apiRoutes);

// Health Check Helper
const getHealthStatus = async (req) => {
  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const readyState = mongoose.connection.readyState;
  const dbStatus = dbStateMap[readyState] || 'unknown';

  let dbStats = { connected: readyState === 1 };
  if (readyState === 1) {
    try {
      dbStats = {
        connected: true,
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
      };
    } catch (e) {
      dbStats.error = e.message;
    }
  }

  return {
    success: readyState === 1,
    message: 'RS Industries API Engine is running',
    version: '2.0.0',
    dbHealth: {
      status: dbStatus,
      readyState,
      ...dbStats
    },
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
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
    correlationId: req.correlationId
  });
});

// Centralized Enterprise Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error] [${req.correlationId}] ${err.stack || err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    correlationId: req.correlationId
  });
});

module.exports = app;
