const mongoose = require('mongoose');
const Product = require('./product.model');
const Category = require('../category/category.model');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    if (category && category.trim().toUpperCase() !== 'ALL') {
      const catInput = category.trim();

      // Look up Category document by slug, _id, or name
      const catConditions = [
        { slug: catInput.toLowerCase() },
        { name: { $regex: new RegExp(`^${catInput.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
      ];

      if (mongoose.Types.ObjectId.isValid(catInput)) {
        catConditions.push({ _id: catInput });
      }

      const matchedCat = await Category.findOne({ $or: catConditions });

      if (matchedCat) {
        const catNameEscaped = matchedCat.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        query.$or = [
          { categoryRef: matchedCat._id },
          { categorySlug: matchedCat.slug },
          { category: matchedCat.slug },
          { category: matchedCat.name },
          { category: { $regex: new RegExp(`^${catNameEscaped}$`, 'i') } },
          { category: { $regex: new RegExp(`^${matchedCat.slug}$`, 'i') } },
        ];
      } else {
        const catEscaped = catInput.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        query.$or = [
          { categorySlug: catInput.toLowerCase() },
          { category: catInput },
          { category: { $regex: new RegExp(`^${catEscaped}$`, 'i') } },
        ];
      }
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await Product.find(query).populate('categoryRef').sort({ createdAt: -1 });
    return res.json(products || []);
  } catch (err) {
    console.error('DB product query error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch products from database' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete product' });
  }
};
