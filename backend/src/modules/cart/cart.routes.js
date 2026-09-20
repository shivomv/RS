const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');

router.get('/', cartController.getCart);
router.post('/sync', cartController.syncCart);
router.post('/clear', cartController.clearCart);

module.exports = router;
