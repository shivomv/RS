const express = require('express');
const router = express.Router();
const deviceController = require('./device.controller');

const realtimeService = require('../../services/realtime.service');

router.post('/login', deviceController.loginAdmin);
router.get('/users', deviceController.getAdminUsers);
router.post('/users', deviceController.createAdminUser);
router.delete('/users/:id', deviceController.deleteAdminUser);

router.post('/device-token', deviceController.registerDeviceToken);
router.delete('/device-token', deviceController.unregisterDeviceToken);
router.get('/devices', deviceController.getRegisteredDevices);
router.get('/order-stream', realtimeService.handleSseConnection);

module.exports = router;
