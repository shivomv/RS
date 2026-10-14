const Cart = require('./cart.model');

exports.getCart = async (req, res, next) => {
  try {
    let shopkeeperId = req.query.shopkeeperId;
    
    // Try to extract from Authorization header if not in query
    if (!shopkeeperId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        shopkeeperId = authHeader.substring(7);
      }
    }
    
    if (!shopkeeperId) {
      return res.json({
        success: true,
        data: { items: [], couponCode: 'RSBULK100', gstRequested: true },
        correlationId: req.correlationId
      });
    }

    let cart = await Cart.findOne({ shopkeeper: shopkeeperId });
    if (!cart) {
      cart = { items: [], couponCode: 'RSBULK100', gstRequested: true };
    }

    res.json({
      success: true,
      data: cart,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
};

exports.syncCart = async (req, res, next) => {
  try {
    let { shopkeeperId, items, couponCode, gstRequested } = req.body;
    
    // Try to extract from Authorization header if not in body
    if (!shopkeeperId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        shopkeeperId = authHeader.substring(7);
      }
    }
    
    if (!shopkeeperId) {
      return res.status(400).json({
        success: false,
        error: 'Shopkeeper ID is required to sync cart',
        code: 'INVALID_INPUT',
        correlationId: req.correlationId
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { shopkeeper: shopkeeperId },
      { items: items || [], couponCode: couponCode || 'RSBULK100', gstRequested: gstRequested !== false },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Cart synchronized successfully',
      data: cart,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let { shopkeeperId } = req.body;
    
    // Try to extract from Authorization header if not in body
    if (!shopkeeperId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        shopkeeperId = authHeader.substring(7);
      }
    }
    
    if (shopkeeperId) {
      await Cart.deleteOne({ shopkeeper: shopkeeperId });
    }
    res.json({
      success: true,
      message: 'Cart cleared',
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
};
