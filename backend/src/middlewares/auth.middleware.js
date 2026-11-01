const jwt = require('jsonwebtoken');
const { Shopkeeper, AdminUser } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'rs_industries_jwt_secret_key_2026';

/**
 * Verify JWT Bearer Token (Shopkeeper or Admin)
 */
async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.',
        code: 'UNAUTHORIZED',
        correlationId: req.correlationId,
      });
    }

    const token = authHeader.substring(7).trim();

    // 1. Try decoding standard JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      // 2. Backward compatibility for legacy numeric user IDs during transition
      if (!isNaN(Number(token))) {
        const numId = Number(token);
        const shopkeeper = await Shopkeeper.findByPk(numId);
        if (shopkeeper) {
          req.user = {
            id: shopkeeper.id,
            mobile: shopkeeper.mobile,
            name: shopkeeper.name,
            shopName: shopkeeper.shopName,
            role: shopkeeper.role || 'buyer',
          };
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token. Please log in again.',
        code: 'TOKEN_INVALID',
        correlationId: req.correlationId,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failure: ' + err.message,
      code: 'AUTH_ERROR',
      correlationId: req.correlationId,
    });
  }
}

/**
 * Require Admin or Superadmin role
 */
async function requireAdmin(req, res, next) {
  await verifyAuth(req, res, () => {
    const role = (req.user?.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Access restricted to authorized administrative personnel only.',
      code: 'FORBIDDEN_ADMIN_ONLY',
      correlationId: req.correlationId,
    });
  });
}

/**
 * Optional Auth - attaches req.user if valid token provided, but doesn't block request
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (_) {
        if (!isNaN(Number(token))) {
          const shopkeeper = await Shopkeeper.findByPk(Number(token));
          if (shopkeeper) {
            req.user = {
              id: shopkeeper.id,
              mobile: shopkeeper.mobile,
              name: shopkeeper.name,
              role: shopkeeper.role || 'buyer',
            };
          }
        }
      }
    }
  } catch (_) {}
  next();
}

/**
 * Generate signed JWT token
 */
function generateToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  verifyAuth,
  requireAdmin,
  optionalAuth,
  generateToken,
  JWT_SECRET,
};
