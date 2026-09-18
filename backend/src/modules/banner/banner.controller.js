const Banner = require('./banner.model');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (err) {
    res.json([
      {
        title: 'Save up to 45% on Bulk Packs',
        subtitle: 'Direct from Factory Dispatch',
        badge: 'Wholesale B2B',
        discountPercent: 45,
        targetCategory: 'Floor Cleaners',
      },
    ]);
  }
};
