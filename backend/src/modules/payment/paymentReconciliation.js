const Payment = require('./payment.model');
const Order = require('../order/order.model');

/**
 * Background Payment Reconciliation Handler
 * Scans for stale PENDING payments older than 10 minutes and reconciles them
 */
async function reconcileStalePayments() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const stalePayments = await Payment.find({
      upiStatus: 'PENDING',
      createdAt: { $lt: tenMinutesAgo },
    });

    if (stalePayments.length === 0) {
      return { count: 0 };
    }

    console.log(`[PaymentReconciliation] Found ${stalePayments.length} stale pending payment(s) to reconcile...`);

    let updatedCount = 0;
    for (const payment of stalePayments) {
      // Check if order was separately confirmed
      const order = await Order.findOne({ $or: [{ _id: payment.order }, { orderId: payment.orderId }] });
      if (order && order.paymentStatus === 'PAID') {
        payment.upiStatus = 'SUCCESS';
        payment.status = 'success';
        await payment.save();
        updatedCount++;
      } else {
        // Leave pending or mark for retry
        payment.rawVerification = { reconciledAt: new Date(), note: 'Awaiting manual statement verification' };
        await payment.save();
      }
    }

    return { count: stalePayments.length, reconciled: updatedCount };
  } catch (err) {
    console.error('[PaymentReconciliation] Error running job:', err.message);
    return { error: err.message };
  }
}

module.exports = {
  reconcileStalePayments,
};
