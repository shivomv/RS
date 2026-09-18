const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  buyerName: { type: String, default: 'Indiranagar Facilities Ltd' },
  buyerPhone: { type: String, default: '+919876543210' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    subtitle: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
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
