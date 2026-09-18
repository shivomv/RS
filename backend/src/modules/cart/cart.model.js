const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    size: { type: String, default: '500ml' },
  }],
  couponCode: { type: String, default: 'RSBULK100' },
  gstRequested: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
