const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  buyerName: { type: String, default: 'Indiranagar Facilities Ltd' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  verifiedPurchase: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
