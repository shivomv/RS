const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);

module.exports = router;
