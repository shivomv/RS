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
