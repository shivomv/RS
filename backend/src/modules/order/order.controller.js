const { Op } = require('sequelize');
const { Order, Shopkeeper } = require('../../models');

function formatOrderResponse(ord) {
  const json = ord.toJSON ? ord.toJSON() : ord;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getAllOrders = async (req, res) => {
  try {
    let shopkeeperId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      shopkeeperId = authHeader.substring(7);
    }
    if (req.query.shopkeeperId) {
      shopkeeperId = req.query.shopkeeperId;
    }

    const where = {};
    if (shopkeeperId && !isNaN(Number(shopkeeperId))) {
      where.shopkeeperId = Number(shopkeeperId);
    }

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.json(orders.map(formatOrderResponse));
  } catch (err) {
    console.warn('[OrderController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    let shopkeeperId = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const parsed = Number(authHeader.substring(7));
      if (!isNaN(parsed)) shopkeeperId = parsed;
    } else if (orderData.shopkeeper && !isNaN(Number(orderData.shopkeeper))) {
      shopkeeperId = Number(orderData.shopkeeper);
    } else if (orderData.buyerSnapshot?.mobile) {
      try {
        const found = await Shopkeeper.findOne({ where: { mobile: orderData.buyerSnapshot.mobile } });
        if (found) shopkeeperId = found.id;
      } catch (_) {}
    }

    const orderId = orderData.orderId || orderData.id || `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build Itemized Product Snapshot
    let items = Array.isArray(orderData.items) ? orderData.items : [];
    items = items.map((i) => {
      const uPrice = Number(i.unitPrice || i.price || i.product?.price || 99);
      const qty = Number(i.quantity || i.qty || 1);
      const bundleLabel = i.bundleName || i.bundleLabel || i.bundle?.label || i.variantLabel || '';
      const bundleQty = i.bundleQuantity || i.bundle?.quantity || null;
      return {
        product: i.product?.id || i.product?._id || i.productId || i.product || i._id,
        productId: String(i.productId || i.product?.id || i.product?._id || i._id || ''),
        variantId: String(i.variantId || ''),
        bundleId: String(i.bundleId || i.bundle?.bundleId || ''),
        bundleName: bundleLabel,
        bundleLabel: bundleLabel,
        bundleQuantity: bundleQty,
        name: i.name || i.product?.name || 'Product',
        subtitle: i.subtitle || bundleLabel || i.size || i.product?.size || '',
        size: i.size || i.product?.size || '',
        image: i.image || i.product?.image || '',
        categoryName: i.categoryName || i.product?.category || '',
        unitPrice: uPrice,
        quantity: qty,
        lineTotal: uPrice * qty,
        price: uPrice,
      };
    });

    const deliveryAddressSnapshot = orderData.deliveryAddressSnapshot || {
      fullAddress: orderData.deliveryAddress || 'Indiranagar, Bengaluru - 560038',
      capturedAt: new Date(),
    };

    const buyerSnapshot = orderData.buyerSnapshot || {
      name: orderData.buyerName || 'Indiranagar Facilities Ltd',
      mobile: orderData.buyerPhone || '+919876543210',
    };

    const sub = Number(orderData.subtotal || items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0);
    const gst = Number(orderData.gstAmount || orderData.gst || Math.round(sub * 0.18));
    const tot = Number(orderData.totalAmount || orderData.total || (sub + gst));

    const financialSnapshot = orderData.financialSnapshot || {
      subtotal: sub,
      gstAmount: gst,
      gstPercentage: 18,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount: tot,
    };

    const newOrder = await Order.create({
      orderId,
      shopkeeperId,
      buyerName: buyerSnapshot.name,
      buyerPhone: buyerSnapshot.mobile,
      items,
      buyerSnapshot,
      deliveryAddressSnapshot,
      financialSnapshot,
      subtotal: sub,
      gstAmount: gst,
      totalAmount: tot,
      transactionId: orderData.transactionId || orderData.txnId || null,
      paymentStatus: orderData.paymentStatus || (orderData.transactionId ? 'paid' : 'pending'),
      paymentMethod: orderData.paymentMethod || 'Google Pay (Tez UPI)',
      deliveryAddress: deliveryAddressSnapshot.fullAddress,
      driverName: orderData.driverName || 'Ramesh Kumar (RS Dispatch)',
      driverPhone: orderData.driverPhone || '+919876512345',
      status: orderData.status || 'pending',
    });

    return res.status(201).json(formatOrderResponse(newOrder));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to create order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, driverName, driverPhone } = req.body;

    const numId = Number(id);
    const where = !isNaN(numId)
      ? { [Op.or]: [{ id: numId }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne({ where });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (driverName !== undefined) updateFields.driverName = driverName;
    if (driverPhone !== undefined) updateFields.driverPhone = driverPhone;

    await order.update(updateFields);
    return res.json(formatOrderResponse(order));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
};
