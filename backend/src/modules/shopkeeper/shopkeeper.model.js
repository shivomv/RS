const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  shopName: { type: String, required: true },
  address: { type: String },
  gstin: { type: String, default: '29AABCU9603R1ZM' },
  email: { type: String, default: 'procurement@indiranagarfacilities.com' },
  role: { type: String, enum: ['buyer', 'admin'], default: 'buyer' },
  outstandingBalance: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 100000 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);
