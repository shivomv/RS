const mongoose = require('mongoose');

// 1. Bundle Sub-Schema
const bundleSchema = new mongoose.Schema({
  bundleId: { type: String, required: true },
  sku: { type: String },
  barcode: { type: String },
  label: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stockQuantity: { type: Number, default: 50 },
  image: { type: String },
});

// 2. Pricing Tier Sub-Schema
const pricingTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true, default: 1 },
  maxQty: { type: Number, default: null },
  pricePerUnit: { type: Number, required: true },
  mrpPerUnit: { type: Number, required: true },
});

// 3. Variant Sub-Schema
const variantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  sku: { type: String },
  barcode: { type: String },
  label: { type: String, required: true },
  attributes: {
    size: { type: String, default: 'Standard' },
    type: { type: String, default: 'Bottle' },
  },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  basePrice: { type: Number, required: true },
  baseMrp: { type: Number, required: true },
  stockQuantity: { type: Number, default: 100 },
  variantImages: [{ type: String }],
  pricingTiers: [pricingTierSchema],
  bundles: [bundleSchema],
});

// 4. Master Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  subtitle: { type: String },
  description: { type: String },
  brand: { type: String, default: 'RS Pro' },
  categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categorySlug: { type: String },
  category: {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    slug: { type: String },
  },
  baseImages: [{ type: String }],
  image: { type: String }, // Top-level fallback image
  price: { type: Number }, // Top-level starting price
  mrp: { type: Number },   // Top-level starting MRP
  badge: { type: String, default: 'Wholesale' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 1 },
  variants: [variantSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
