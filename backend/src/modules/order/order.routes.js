const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { optionalAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.get('/', optionalAuth, orderController.getAllOrders);
router.post('/', optionalAuth, orderController.createOrder);
router.post('/:id/cancel', optionalAuth, orderController.cancelOrder);
router.get('/:id/invoice', orderController.getOrderInvoice);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);

module.exports = router;
