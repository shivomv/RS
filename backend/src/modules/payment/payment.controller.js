const mongoose = require('mongoose');
const Payment = require('./payment.model');
const Order = require('../order/order.model');
const { generatePaymentReference, generateUpiUrl } = require('./upiService');
const { verifyTransaction } = require('./paymentVerifier');

/**
 * 1. Create Order & Payment Intent (PENDING state)
 * Returns server-generated clean P2P UPI URL and reference
 */
exports.createIntent = async (req, res, next) => {
  try {
    const { orderData } = req.body;
    if (!orderData || (!orderData.items && !orderData.total)) {
      return res.status(400).json({ success: false, error: 'Invalid order payload' });
    }

    // Generate Order ID & Reference
    const orderId = orderData.orderId || orderData.id || `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const reference = generatePaymentReference(orderId);

    // Build Financial & Address Snapshots
    const sub = orderData.subtotal || orderData.financialSnapshot?.subtotal || orderData.items?.reduce((s, i) => s + ((i.unitPrice || i.price || 99) * (i.quantity || 1)), 0) || 0;
    const gst = orderData.gstAmount || orderData.financialSnapshot?.gstAmount || Math.round(sub * 0.18);
    const tot = Math.round(orderData.totalAmount || orderData.total || orderData.financialSnapshot?.totalAmount || (sub + gst));

    const financialSnapshot = orderData.financialSnapshot || {
      subtotal: sub,
      gstAmount: gst,
      totalAmount: tot,
    };

    const deliveryAddressSnapshot = orderData.deliveryAddressSnapshot || {
      fullAddress: typeof orderData.deliveryAddress === 'string' ? orderData.deliveryAddress : 'Indiranagar, Bengaluru - 560038',
    };

    // Create Order Record in PENDING state
    const order = await Order.create({
      ...orderData,
      orderId,
      subtotal: sub,
      gstAmount: gst,
      totalAmount: tot,
      financialSnapshot,
      deliveryAddressSnapshot,
      paymentMethod: 'Google Pay (Tez UPI)',
      paymentStatus: 'PENDING',
      status: 'pending',
    });

    // Generate Clean P2P UPI URL for shivom3268@naviaxis
    const upiInfo = generateUpiUrl({
      reference,
      amount: tot,
      note: `RS Order #${reference}`,
    });

    // Create Payment Record in PENDING state
    const payment = await Payment.create({
      order: order._id,
      orderId: order.orderId,
      reference,
      shopkeeper: orderData.shopkeeper,
      amount: tot,
      payeeVpa: upiInfo.payeeVpa,
      upiUrl: upiInfo.upiUrl,
      upiStatus: 'PENDING',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        orderId: order.orderId,
        reference: payment.reference,
        amount: tot,
        upiUrl: upiInfo.upiUrl,
        gpayUrl: upiInfo.gpayUrl,
        payeeVpa: upiInfo.payeeVpa,
        payeeName: upiInfo.payeeName,
      },
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Verify Payment Callback from Mobile App
 * Performs 5-layer Anti-Fraud verification and updates MongoDB
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference, transactionId, upiStatus, paidAmount, rawData } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Payment reference is required' });
    }

    const verificationResult = await verifyTransaction({
      reference,
      transactionId,
      upiStatus,
      paidAmount,
      rawData,
    });

    return res.json({
      success: verificationResult.success,
      message: verificationResult.success ? 'Payment verified successfully. Order confirmed.' : 'Payment verification failed.',
      data: {
        orderId: verificationResult.order.orderId,
        reference: verificationResult.payment.reference,
        paymentStatus: verificationResult.order.paymentStatus,
        orderStatus: verificationResult.order.status,
        transactionId: verificationResult.payment.transactionId,
      },
      correlationId: req.correlationId,
    });
  } catch (error) {
    return res.status(422).json({
      success: false,
      error: error.message || 'Payment Verification Failed',
      correlationId: req.correlationId,
    });
  }
};

/**
 * 3. Poll Payment & Order Status
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne(isObjectId ? { $or: [{ _id: orderId }, { orderId }] } : { orderId });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const payment = await Payment.findOne({ $or: [{ order: order._id }, { orderId: order.orderId }] }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus || 'PENDING',
        orderStatus: order.status,
        transactionId: order.transactionId || payment?.transactionId || null,
        amount: order.totalAmount,
      },
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. List All Payments (Admin)
 */
exports.getPayments = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId;
    const filter = shopkeeperId ? { shopkeeper: shopkeeperId } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: payments, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
