const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true, unique: true },
  items: [{
    productId: { type: String },
    variantId: { type: String },
    bundleId: { type: String },
    cartItemId: { type: String },
    title: { type: String },
    name: { type: String },
    variantLabel: { type: String },
    bundleLabel: { type: String },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: 'Standard' },
    price: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    image: { type: String },
  }],
  couponCode: { type: String, default: 'RSBULK100' },
  gstRequested: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
