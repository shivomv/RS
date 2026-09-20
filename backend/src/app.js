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
async function ensureDbConnected(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ [DB Middleware] MONGO_URI is not set in process.env');
    return res.status(500).json({
      success: false,
      error: 'Database Configuration Error: MONGO_URI environment variable is missing in process.env',
      code: 'DB_CONFIG_ERROR',
      correlationId: req.correlationId
    });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    } else if (mongoose.connection.readyState === 2) {
      let retries = 50;
      while (mongoose.connection.readyState === 2 && retries > 0) {
        await new Promise((r) => setTimeout(r, 100));
        retries--;
      }
    }

    if (mongoose.connection.readyState === 1) {
      return next();
    }

    throw new Error(`MongoDB connection state is ${mongoose.connection.readyState}`);
  } catch (err) {
    console.error('❌ [DB Middleware] MongoDB Connection Error:', err.message);
    return res.status(503).json({
      success: false,
      error: `Database Connection Failed: ${err.message}`,
      code: 'DB_CONNECTION_ERROR',
      correlationId: req.correlationId
    });
  }
}

app.use(ensureDbConnected);

// Mount Master API Router for all 15 domain modules under /api
app.use('/api', apiRoutes);

// Health Check Helper
const getHealthStatus = async (req) => {
  const MONGO_URI = process.env.MONGO_URI;
  if (mongoose.connection.readyState === 0 && MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    } catch (e) {
      console.error('❌ [Health Check] Auto-connect attempt failed:', e.message);
    }
  }

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
