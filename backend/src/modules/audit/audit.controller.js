const AuditLog = require('./auditLog.model');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.createAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });
    res.status(201).json({ success: true, data: log, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
