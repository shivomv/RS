const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');

router.get('/', auditController.getAuditLogs);
router.post('/', auditController.createAuditLog);

module.exports = router;
