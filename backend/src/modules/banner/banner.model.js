const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String, default: 'Direct from Factory' },
  discountPercent: { type: Number, default: 45 },
  image: { type: String },
  targetCategory: { type: String, default: 'Floor Cleaners' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
