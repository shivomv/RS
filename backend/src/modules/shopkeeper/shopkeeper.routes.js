const express = require('express');
const router = express.Router();
const shopkeeperController = require('./shopkeeper.controller');

router.get('/', shopkeeperController.getShopkeepers);
router.post('/', shopkeeperController.createShopkeeper);

module.exports = router;
