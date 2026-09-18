const express = require('express');
const router = express.Router();
const ledgerController = require('./ledger.controller');

router.get('/', ledgerController.getLedgers);

module.exports = router;
