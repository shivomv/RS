const Product = require('./product.model');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    if (category && category.trim().toUpperCase() !== 'ALL') {
      const escapedCategory = category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
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
