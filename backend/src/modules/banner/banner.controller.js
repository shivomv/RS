const Banner = require('./banner.model');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    return res.json(banners || []);
  } catch (err) {
    console.warn('[BannerController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    data.image = data.image || data.imageUrl || '';
    const banner = await Banner.create(data);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create banner' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete banner' });
  }
};
