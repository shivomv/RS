const express = require('express');
const router = express.Router();
const deviceController = require('./device.controller');
const { requireAdmin } = require('../../middlewares/auth.middleware');

const realtimeService = require('../../services/realtime.service');

router.post('/login', deviceController.loginAdmin);
router.post('/google', deviceController.loginAdminGoogle);
router.get('/users', requireAdmin, deviceController.getAdminUsers);
router.post('/users', requireAdmin, deviceController.createAdminUser);
router.put('/users/:id', requireAdmin, deviceController.updateAdminUser);
router.delete('/users/:id', requireAdmin, deviceController.deleteAdminUser);

router.post('/device-token', deviceController.registerDeviceToken);
router.delete('/device-token', deviceController.unregisterDeviceToken);
router.get('/devices', requireAdmin, deviceController.getRegisteredDevices);
router.get('/order-stream', realtimeService.handleSseConnection);

module.exports = router;
