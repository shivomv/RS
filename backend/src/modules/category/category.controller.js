const Category = require('./category.model');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    return res.json(categories || []);
  } catch (err) {
    console.warn('[CategoryController] DB category query error, returning empty list:', err.message);
    return res.json([]);
  }
};
