const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true }, // Name, slug, or ID
  categorySlug: { type: String },
  categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  badge: { type: String, default: 'Wholesale' },
  subtitle: { type: String, default: 'Industrial Formula' },
  image: { type: String },
  stockQuantity: { type: Number, default: 100 },
  packSizes: [{ type: String }],
  tierRates: [{
    minQty: { type: Number },
    ratePerUnit: { type: Number },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
