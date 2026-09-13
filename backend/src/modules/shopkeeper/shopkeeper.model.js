const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  shopName: { type: String, required: true },
  address: { type: String },
  outstandingBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);
