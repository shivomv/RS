const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderId: { type: String, required: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'NET_BANKING', 'CREDIT_LEDGER', 'NEFT_RTGS'], default: 'UPI' },
  transactionId: { type: String, default: 'TXN-99882234' },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
