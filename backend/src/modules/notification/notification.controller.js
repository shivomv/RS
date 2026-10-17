const { Notification } = require('../../models');

function formatNotification(n) {
  const json = n.toJSON ? n.toJSON() : n;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getNotifications = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId;
    const where = shopkeeperId && !isNaN(Number(shopkeeperId)) ? { shopkeeperId: Number(shopkeeperId) } : {};
    const notifications = await Notification.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: notifications.map(formatNotification), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: formatNotification(notification), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
