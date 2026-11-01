const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { requireAdmin } = require('../../middlewares/auth.middleware');

router.get('/', productController.getAllProducts);
router.post('/', requireAdmin, productController.createProduct);
router.put('/:id', requireAdmin, productController.updateProduct);
router.delete('/:id', requireAdmin, productController.deleteProduct);

module.exports = router;
