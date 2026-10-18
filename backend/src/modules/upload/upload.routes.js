const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');

router.post('/', uploadController.uploadImage);
router.post('/multiple', uploadController.uploadMultipleImages);

module.exports = router;
