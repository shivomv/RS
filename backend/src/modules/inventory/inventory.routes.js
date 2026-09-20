const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');

router.get('/', inventoryController.getBatches);
router.post('/', inventoryController.addBatch);

module.exports = router;
