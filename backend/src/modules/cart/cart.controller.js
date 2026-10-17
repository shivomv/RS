const { Cart } = require('../../models');

exports.getCart = async (req, res, next) => {
  try {
    let shopkeeperId = req.query.shopkeeperId;
    if (!shopkeeperId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      shopkeeperId = req.headers.authorization.substring(7);
    }

    const numId = Number(shopkeeperId);
    if (!shopkeeperId || isNaN(numId)) {
      return res.json({
        success: true,
        data: { items: [], couponCode: 'RSBULK100', gstRequested: true },
        correlationId: req.correlationId,
      });
    }

    let cart = await Cart.findOne({ where: { shopkeeperId: numId } });
    const cartData = cart
      ? {
          items: cart.items || [],
          couponCode: cart.couponCode || 'RSBULK100',
          gstRequested: cart.gstRequested !== false,
        }
      : { items: [], couponCode: 'RSBULK100', gstRequested: true };

    res.json({
      success: true,
      data: cartData,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.syncCart = async (req, res, next) => {
  try {
    let { shopkeeperId, items, couponCode, gstRequested } = req.body;
    if (!shopkeeperId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      shopkeeperId = req.headers.authorization.substring(7);
    }

    const numId = Number(shopkeeperId);
    if (!shopkeeperId || isNaN(numId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid numeric Shopkeeper ID is required to sync cart',
        code: 'INVALID_INPUT',
        correlationId: req.correlationId,
      });
    }

    let [cart] = await Cart.findOrCreate({
      where: { shopkeeperId: numId },
      defaults: {
        shopkeeperId: numId,
        items: items || [],
        couponCode: couponCode || 'RSBULK100',
        gstRequested: gstRequested !== false,
      },
    });

    await cart.update({
      items: items || [],
      couponCode: couponCode || 'RSBULK100',
      gstRequested: gstRequested !== false,
    });

    res.json({
      success: true,
      message: 'Cart synchronized successfully',
      data: cart,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let { shopkeeperId } = req.body;
    if (!shopkeeperId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      shopkeeperId = req.headers.authorization.substring(7);
    }

    const numId = Number(shopkeeperId);
    if (shopkeeperId && !isNaN(numId)) {
      await Cart.destroy({ where: { shopkeeperId: numId } });
    }
    res.json({
      success: true,
      message: 'Cart cleared',
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};
