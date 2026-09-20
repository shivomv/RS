const Cart = require('./cart.model');

exports.getCart = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId || req.user?.id;
    if (!shopkeeperId) {
      return res.json({
        success: true,
        data: { items: [], couponCode: 'RSBULK100', gstRequested: true },
        correlationId: req.correlationId
      });
    }

    let cart = await Cart.findOne({ shopkeeper: shopkeeperId }).populate('items.product');
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
    const { shopkeeperId, items, couponCode, gstRequested } = req.body;
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
    const { shopkeeperId } = req.body;
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
