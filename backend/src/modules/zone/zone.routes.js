const express = require('express');
const router = express.Router();
const zoneController = require('./zone.controller');

// Public/Buyer Endpoints
router.get('/check', zoneController.checkServiceability);
router.get('/pincode/:pincode', zoneController.getPincodeDetails);
router.get('/reverse-geocode', zoneController.reverseGeocode);
router.get('/', zoneController.getAllZones);

// Admin Configuration Endpoints
router.post('/', zoneController.addOrUpdateZone);
router.delete('/:pincode', zoneController.deleteZone);

module.exports = router;
