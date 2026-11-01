const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyAuth } = require('../../middlewares/auth.middleware');

// Mobile Direct Sign-in & Signup (No DLT SMS required)
router.post('/direct-login', authController.directLoginOrSignup);
router.post('/google', authController.googleAuth);
router.put('/profile', verifyAuth, authController.updateProfile);
router.post('/profile', verifyAuth, authController.updateProfile);

// Backward-compatible endpoints
router.post('/request-otp', authController.requestToken);
router.post('/verify-otp', authController.verifyToken);

module.exports = router;
