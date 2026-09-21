const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: String },
    variantId: { type: String },
    bundleId: { type: String },
    cartItemId: { type: String },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: 'Standard' },
    price: { type: Number, default: 0 },
  }],
  couponCode: { type: String, default: 'RSBULK100' },
  gstRequested: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
