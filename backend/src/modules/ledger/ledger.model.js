const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  gstTax: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
  terms: { type: String, default: 'Net 30 Days' },
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
