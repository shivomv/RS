const Order = require('./order.model');
const Shopkeeper = require('../shopkeeper/shopkeeper.model');

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    
    // Update Shopkeeper outstanding balance
    await Shopkeeper.findByIdAndUpdate(req.body.shopkeeper, {
      $inc: { outstandingBalance: req.body.totalAmount }
    });
    
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' }).populate('shopkeeper');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
