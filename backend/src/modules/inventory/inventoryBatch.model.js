const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  batchNumber: { type: String, required: true, unique: true },
  mfgDate: { type: Date, default: Date.now },
  expDate: { type: Date },
  qcCertificateNo: { type: String, default: 'COA-2026-9941' },
  batchQuantity: { type: Number, default: 500 },
}, { timestamps: true });

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
