const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  buyerName: { type: String, default: 'Indiranagar Facilities Ltd' },
  buyerPhone: { type: String, default: '+919876543210' },

  // Immutable Itemized Product Snapshot
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: String },
    variantId: { type: String },
    bundleId: { type: String },
    cartItemId: { type: String },
    name: { type: String, required: true },
    subtitle: { type: String },
    size: { type: String },
    image: { type: String },
    categoryName: { type: String },
    unitPrice: { type: Number },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number },
    price: { type: Number }, // Backward compatibility
  }],

  // Immutable Buyer Info Snapshot
  buyerSnapshot: {
    id: { type: String },
    name: { type: String },
    mobile: { type: String },
    role: { type: String },
  },

  // Immutable Delivery Address Snapshot
  deliveryAddressSnapshot: {
    fullAddress: { type: String, required: true },
    facilityName: { type: String },
    city: { type: String },
    pincode: { type: String },
    capturedAt: { type: Date, default: Date.now },
  },

  // Immutable Financial Summary Snapshot
  financialSnapshot: {
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    gstPercentage: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },

  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  deliveryAddress: { type: String, default: 'Indiranagar, Bengaluru - 560038' },
  driverName: { type: String, default: 'Ramesh Kumar (RS Dispatch)' },
  driverPhone: { type: String, default: '+919876512345' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'dispatching', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
