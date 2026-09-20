const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');

router.get('/', reviewController.getReviews);
router.post('/', reviewController.addReview);

module.exports = router;
