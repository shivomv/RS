const { Banner } = require('../../models');

function formatBanner(b) {
  const json = b.toJSON ? b.toJSON() : b;
  return {
    ...json,
    _id: String(json.id),
    imageUrl: json.image,
  };
}

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ where: { isActive: true } });
    return res.json(banners.map(formatBanner));
  } catch (err) {
    console.warn('[BannerController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    data.image = (data.image || data.imageUrl || '').trim();
    const banner = await Banner.create(data);
    res.status(201).json(formatBanner(banner));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create banner' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    await banner.destroy();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete banner' });
  }
};
