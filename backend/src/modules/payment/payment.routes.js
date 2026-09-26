const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

router.get('/', paymentController.getPayments);
router.post('/create-intent', paymentController.createIntent);
router.post('/verify', paymentController.verifyPayment);
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
