const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
