const express = require('express');
const router = express.Router();
const companyController = require('./company.controller');

// Public endpoint for buyer app
router.get('/', companyController.getCompanyDetails);

// Admin endpoints
router.put('/', companyController.updateCompanyDetails);
router.get('/admin', companyController.getCompanyForAdmin);

module.exports = router;
