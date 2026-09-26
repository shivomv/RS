const Category = require('./category.model');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    return res.json(categories || []);
  } catch (err) {
    console.warn('[CategoryController] DB category query error, returning empty list:', err.message);
    return res.json([]);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, icon, image, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const category = await Category.create({
      name,
      slug: catSlug,
      icon: icon || 'cleaning-services',
      image: image || '',
      displayOrder: Number(displayOrder || 0),
    });
    return res.status(201).json(category);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json(category);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update category' });
  }
};
