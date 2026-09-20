const Category = require('./category.model');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    return res.json(categories || []);
  } catch (err) {
    console.error('DB category query error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch categories from database' });
  }
};
