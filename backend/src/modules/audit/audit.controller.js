const { AuditLog } = require('../../models');

function formatLog(l) {
  const json = l.toJSON ? l.toJSON() : l;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: logs.map(formatLog), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.createAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    res.status(201).json({ success: true, data: formatLog(log), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
