const Notification = require('./notification.model');

exports.getNotifications = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId;
    const filter = shopkeeperId ? { shopkeeper: shopkeeperId } : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
