const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/request-otp', authController.requestToken);
router.post('/verify-otp', authController.verifyToken);

module.exports = router;
