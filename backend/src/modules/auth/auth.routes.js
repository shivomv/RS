const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/request-token', authController.requestToken);
router.post('/verify', authController.verifyToken);

module.exports = router;
