const Order = require('./order.model');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders || []);
  } catch (err) {
    console.warn('[OrderController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    orderData.orderId = orderData.orderId || orderData.id || `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build Itemized Product Snapshot
    if (Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map((i) => {
        const uPrice = i.unitPrice || i.price || i.product?.price || 99;
        const qty = i.quantity || i.qty || 1;
        return {
          product: i.product?._id || i.product || i._id,
          productId: String(i.productId || i.product?._id || i._id || ''),
          name: i.name || i.product?.name || 'Product',
          subtitle: i.subtitle || i.size || i.product?.size || '',
          size: i.size || i.product?.size || '500ml',
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
