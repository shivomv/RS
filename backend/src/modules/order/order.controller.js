const Order = require('./order.model');

const fallbackOrders = [
  {
    _id: 'RS-ORD-8942',
    orderId: 'RS-ORD-8942',
    buyerName: 'Indiranagar Facilities Ltd',
    buyerPhone: '+919876543210',
    totalAmount: 3450,
    gstAmount: 621,
    status: 'dispatching',
    paymentMethod: 'UPI',
    deliveryAddress: 'Plot 42, 10th Main, Indiranagar, Bengaluru - 560038',
    driverName: 'Ramesh Kumar (RS Dispatch)',
    driverPhone: '+91 98765 12345',
    items: [
      { name: 'RS Pro Citrus Floor Cleaner', subtitle: '500ml Bottle', quantity: 10, price: 99 },
      { name: 'PowerShield Pine Disinfectant', subtitle: '1L Disinfectant', quantity: 5, price: 149 },
      { name: 'Commercial Kitchen Degreaser', subtitle: '5L Canister', quantity: 2, price: 580 },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'RS-ORD-8102',
    orderId: 'RS-ORD-8102',
    buyerName: 'Peenya Factory Warehouse',
    buyerPhone: '+919876599887',
    totalAmount: 14500,
    gstAmount: 2610,
    status: 'delivered',
    paymentMethod: 'B2B Credit Ledger (Net 30)',
    deliveryAddress: 'Shed 14, Peenya 1st Stage, Bengaluru - 560058',
    driverName: 'Suresh Gowda',
    driverPhone: '+91 98765 44332',
    items: [
      { name: 'RS Master Barrel 200L', subtitle: 'Industrial Drum', quantity: 1, price: 14500 },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
  }
];

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    if (orders && orders.length > 0) {
      return res.json(orders);
    }
    return res.json(fallbackOrders);
  } catch (err) {
    return res.json(fallbackOrders);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    orderData.orderId = orderData.id || `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = await Order.create(orderData);
    fallbackOrders.unshift(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    const newOrder = {
      _id: `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: `RS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      ...req.body,
    };
    fallbackOrders.unshift(newOrder);
    res.status(201).json(newOrder);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    
    // Update memory fallback too
    const match = fallbackOrders.find((o) => o._id === id || o.orderId === id);
    if (match) match.status = status;

    res.json(order || match || { _id: id, status });
  } catch (err) {
    const match = fallbackOrders.find((o) => o._id === req.params.id || o.orderId === req.params.id);
    if (match) match.status = req.body.status;
    res.json(match || { _id: req.params.id, status: req.body.status });
  }
};
