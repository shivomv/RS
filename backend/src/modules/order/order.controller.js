const mongoose = require('mongoose');
const Order = require('./order.model');

exports.getAllOrders = async (req, res) => {
  try {
    // Get shopkeeper ID from Authorization header, query param, or body
    let shopkeeperId = null;
    
    // Try to extract from Authorization header (format: "Bearer <shopkeeperId>")
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      shopkeeperId = authHeader.substring(7);
    }
    
    // Override with query parameter if provided
    if (req.query.shopkeeperId) {
      shopkeeperId = req.query.shopkeeperId;
    }
    
    // Build filter
    const filter = {};
    if (shopkeeperId) {
      // Try to use it as ObjectId if it's a valid MongoDB ID
      if (shopkeeperId.match(/^[0-9a-fA-F]{24}$/)) {
        filter.shopkeeper = shopkeeperId;
      } else {
        // Otherwise just match as string
        filter.shopkeeper = shopkeeperId;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json(orders || []);
  } catch (err) {
    console.warn('[OrderController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const Shopkeeper = require('../shopkeeper/shopkeeper.model');
    const orderData = req.body;
    
    // Extract shopkeeper ID from Authorization header if available
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const shopkeeperId = authHeader.substring(7);
      orderData.shopkeeper = shopkeeperId;
    } else if (!orderData.shopkeeper && orderData.buyerSnapshot?.mobile) {
      // Look up shopkeeper by mobile number from buyerSnapshot
      try {
        const shopkeeper = await Shopkeeper.findOne({ mobile: orderData.buyerSnapshot.mobile });
        if (shopkeeper) {
          orderData.shopkeeper = shopkeeper._id;
        }
      } catch (err) {
        console.warn('[Order] Could not lookup shopkeeper by mobile:', err.message);
      }
    }
    
    orderData.orderId = orderData.orderId || orderData.id || `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build Itemized Product Snapshot
    if (Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map((i) => {
        const uPrice = i.unitPrice || i.price || i.product?.price || 99;
        const qty = i.quantity || i.qty || 1;
        const bundleLabel = i.bundleName || i.bundleLabel || i.bundle?.label || i.variantLabel || '';
        const bundleQty = i.bundleQuantity || i.bundle?.quantity || null;
        return {
          product: i.product?._id || i.product || i._id,
          productId: String(i.productId || i.product?._id || i._id || ''),
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
    }

    // Build Delivery Address Snapshot
    if (!orderData.deliveryAddressSnapshot) {
      orderData.deliveryAddressSnapshot = {
        fullAddress: orderData.deliveryAddress || 'Indiranagar, Bengaluru - 560038',
        capturedAt: new Date(),
      };
    }

    // Build Buyer Snapshot
    if (!orderData.buyerSnapshot) {
      orderData.buyerSnapshot = {
        name: orderData.buyerName || 'Indiranagar Facilities Ltd',
        mobile: orderData.buyerPhone || '+919876543210',
      };
    }

    // Build Financial Summary Snapshot
    const sub = orderData.subtotal || orderData.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0;
    const gst = orderData.gstAmount || orderData.gst || Math.round(sub * 0.18);
    const tot = orderData.totalAmount || orderData.total || (sub + gst);

    orderData.financialSnapshot = orderData.financialSnapshot || {
      subtotal: sub,
      gstAmount: gst,
      gstPercentage: 18,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount: tot,
    };

    orderData.subtotal = sub;
    orderData.gstAmount = gst;
    orderData.totalAmount = tot;
    orderData.transactionId = orderData.transactionId || orderData.txnId || null;
    orderData.paymentStatus = orderData.paymentStatus || (orderData.transactionId ? 'paid' : 'pending');
    orderData.paymentMethod = orderData.paymentMethod || 'Google Pay (Tez UPI)';

    const newOrder = await Order.create(orderData);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, driverName, driverPhone } = req.body;
    
    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (driverName !== undefined) updateFields.driverName = driverName;
    if (driverPhone !== undefined) updateFields.driverPhone = driverPhone;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const order = await Order.findOneAndUpdate(
      isObjectId ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id },
      updateFields,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
};
