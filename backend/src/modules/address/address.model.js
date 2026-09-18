const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  facilityName: { type: String, required: true },
  streetAddress: { type: String, required: true },
  landmark: { type: String },
  pincode: { type: String, required: true },
  city: { type: String, default: 'Bengaluru' },
  state: { type: String, default: 'Karnataka' },
  contactPhone: { type: String },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
