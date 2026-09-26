const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderId: { type: String, required: true },
  reference: { type: String, required: true, unique: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  amount: { type: Number, required: true },
  payeeVpa: { type: String, default: 'shivom3268@naviaxis' },
  paymentMethod: { type: String, default: 'Google Pay (Tez UPI)' },
  upiUrl: { type: String },
  transactionId: { type: String, sparse: true },
  upiStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'pending', 'success', 'failed', 'cancelled'], default: 'PENDING' },
  status: { type: String, enum: ['success', 'pending', 'failed', 'SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'], default: 'pending' },
  rawVerification: { type: Object },
  verifiedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
