const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  adminName: { type: String, default: 'Factory Administrator' },
  action: { type: String, required: true },
  targetModule: { type: String, required: true },
  details: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
