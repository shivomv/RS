const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  shopkeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  buyerName: { type: String, default: 'Indiranagar Facilities Ltd' },
  subject: { type: String, required: true },
  issueType: { type: String, enum: ['GST Invoice', 'Damaged Drum', 'MOQ', 'General Query'], default: 'General Query' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', ticketSchema);
