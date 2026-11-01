const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { requireAdmin } = require('../../middlewares/auth.middleware');

router.get('/', categoryController.getCategories);
router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);

module.exports = router;
