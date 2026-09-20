const mongoose = require('mongoose');
const Product = require('./product.model');
const Category = require('../category/category.model');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category.trim().toUpperCase() !== 'ALL') {
      const catInput = category.trim();

      // Check if input is a MongoDB ObjectId
      const isObjectId = mongoose.Types.ObjectId.isValid(catInput);

      let matchedCat = null;

      // Build conditions to find category
      const catConditions = [];
      
      // If it looks like an ObjectId, search by _id
      if (isObjectId) {
        catConditions.push({ _id: new mongoose.Types.ObjectId(catInput) });
      }
      
      // Always search by slug and name
      catConditions.push(
        { slug: catInput.toLowerCase() },
        { name: { $regex: new RegExp(`^${catInput.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') } }
      );

      // Try to find the category
      try {
        matchedCat = await Category.findOne({ $or: catConditions });
      } catch (e) {
        console.warn('[Product Controller] Error finding category:', e.message);
      }

      // If category found, query products by categoryRef or categorySlug or category name/slug
      if (matchedCat) {
        const catNameEscaped = matchedCat.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const catSlugEscaped = matchedCat.slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        query.$or = [
          { categoryRef: matchedCat._id },
          { categorySlug: matchedCat.slug },
          { category: matchedCat.slug },
          { category: matchedCat.name },
          { category: { $regex: new RegExp(`^${catNameEscaped}`, 'i') } },
          { category: { $regex: new RegExp(`^${catSlugEscaped}`, 'i') } },
        ];
      } else {
        // If category not found in DB, search products by the raw input (slug, name, or ID)
        const catEscaped = catInput.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        query.$or = [
          { categorySlug: catInput.toLowerCase() },
          { category: catInput },
          { category: { $regex: new RegExp(`^${catEscaped}`, 'i') } },
        ];
        
        // If input looks like an ObjectId, also search by categoryRef
        if (isObjectId) {
          query.$or.push({ categoryRef: new mongoose.Types.ObjectId(catInput) });
        }
      }
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await Product.find(query).populate('categoryRef').sort({ createdAt: -1 });
    return res.json(products || []);
  } catch (err) {
    console.error('[ProductController] DB product query error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to fetch products' });
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
