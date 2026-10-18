const { Category } = require('../../models');
const { uploadBase64 } = require('../../services/s3.service');

function formatCategory(c) {
  const json = c.toJSON ? c.toJSON() : c;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
    });
    return res.json(categories.map(formatCategory));
  } catch (err) {
    console.warn('[CategoryController] DB query error:', err.message);
    return res.json([]);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image, icon, displayOrder, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let catImage = (image || icon || '').trim();
    if (catImage.startsWith('data:')) {
      catImage = await uploadBase64(catImage, 'categories');
    }

    const category = await Category.create({
      name: name.trim(),
      slug: catSlug,
      image: catImage, // Use image only, no icon
      displayOrder: Number(displayOrder || 0),
      isActive: isActive !== false,
    });
    return res.status(201).json(formatCategory(category));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const updateData = { ...req.body };
    if (updateData.image || updateData.icon) {
      let img = (updateData.image || updateData.icon).trim();
      if (img.startsWith('data:')) {
        img = await uploadBase64(img, 'categories');
      }
      updateData.image = img;
    }
    await category.update(updateData);
    return res.json(formatCategory(category));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update category' });
  }
};
