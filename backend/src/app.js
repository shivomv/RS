const express = require('express');
const cors = require('cors');

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

// Mount Master API Router for all 15 domain modules under /api
app.use('/api', apiRoutes);

// Health Check Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RS Industries Enterprise Scalable B2B API Engine is running',
    version: '2.0.0',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
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
