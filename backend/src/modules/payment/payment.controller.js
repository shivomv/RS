const Payment = require('./payment.model');

exports.getPayments = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId;
    const filter = shopkeeperId ? { shopkeeper: shopkeeperId } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: payments, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
