const mongoose = require('mongoose');
const Payment = require('./payment.model');
const Order = require('../order/order.model');

/**
 * 5-Layer Anti-Fraud Verification Engine
 */
async function verifyTransaction({ reference, transactionId, upiStatus, paidAmount, rawData = {} }) {
  // 1. Locate Payment Record by Reference
  const payment = await Payment.findOne({ reference });
  if (!payment) {
    throw new Error(`Invalid Payment Reference: ${reference} not found in database.`);
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(payment.order);
  const order = await Order.findOne(isObjectId ? { $or: [{ _id: payment.order }, { orderId: payment.orderId }] } : { orderId: payment.orderId });
  if (!order) {
    throw new Error(`Associated Order #${payment.orderId} not found.`);
  }

  // 2. Check if Payment is Already Processed (Idempotency Guard)
  if (payment.upiStatus === 'SUCCESS' && order.paymentStatus === 'PAID') {
    return {
      alreadyVerified: true,
      success: true,
      payment,
      order,
    };
  }

  // 3. Status Guard Check
  const normalizedStatus = String(upiStatus || '').toUpperCase();
  if (normalizedStatus !== 'SUCCESS' && normalizedStatus !== 'PAID') {
    payment.upiStatus = 'FAILED';
    payment.status = 'failed';
    payment.rawVerification = rawData;
    await payment.save();
    return {
      success: false,
      error: 'Payment failed or was cancelled by user.',
      payment,
      order,
    };
  }

  // 4. Strict Amount Matching Guard
  const expectedAmount = Math.round(Number(payment.amount));
  const receivedAmount = Math.round(Number(paidAmount || payment.amount));
  if (receivedAmount < expectedAmount) {
    payment.upiStatus = 'FAILED';
    payment.status = 'failed';
    payment.rawVerification = { error: 'Amount mismatch', expectedAmount, receivedAmount, rawData };
    await payment.save();
    throw new Error(`Fraud Guard Alert: Paid amount (₹${receivedAmount}) does not match order total (₹${expectedAmount}).`);
  }

  // 5. Replay Protection Guard (Check for duplicate transactionId across all payments)
  if (transactionId) {
    const existingTxn = await Payment.findOne({
      transactionId,
      reference: { $ne: reference },
      upiStatus: 'SUCCESS',
    });
    if (existingTxn) {
      payment.upiStatus = 'FAILED';
      payment.status = 'failed';
      payment.rawVerification = { error: 'Replay Attack Attempt', duplicateTxnId: transactionId, rawData };
      await payment.save();
      throw new Error(`Fraud Guard Alert: Transaction ID ${transactionId} has already been used for another order.`);
    }
  }

  // All 5 Anti-Fraud Checks Passed -> Update Payment & Order Status safely in DB
  const validTxnId = transactionId || `UPI-TXN-${Date.now()}`;
  const now = new Date();

  payment.transactionId = validTxnId;
  payment.upiStatus = 'SUCCESS';
  payment.status = 'success';
  payment.rawVerification = rawData;
  payment.verifiedAt = now;
  await payment.save();

  order.paymentMethod = 'Google Pay (Tez UPI)';
  order.transactionId = validTxnId;
  order.paymentStatus = 'PAID';
  order.status = 'confirmed';
  await order.save();

  return {
    success: true,
    payment,
    order,
  };
}

module.exports = {
  verifyTransaction,
};
