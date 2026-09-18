const Category = require('./category.model');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (err) {
    res.json([
      { name: 'Floor Cleaners', slug: 'floor-cleaners', icon: 'cleaning-services' },
      { name: 'Disinfectants', slug: 'disinfectants', icon: 'sanitizer' },
      { name: 'Dishwash & Degreaser', slug: 'dishwash-degreaser', icon: 'flatware' },
      { name: 'Glass & Surface', slug: 'glass-surface', icon: 'window' },
      { name: 'Handwash', slug: 'handwash', icon: 'wash' },
      { name: 'Bulk Drums', slug: 'bulk-drums', icon: 'inventory-2' },
    ]);
  }
};
