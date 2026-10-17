const { Review, Product } = require('../../models');

function formatReview(r) {
  const json = r.toJSON ? r.toJSON() : r;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getReviews = async (req, res, next) => {
  try {
    const productId = req.query.productId;
    const where = productId && !isNaN(Number(productId)) ? { productId: Number(productId) } : {};
    const reviews = await Review.findAll({
      where,
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: reviews.map(formatReview), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: formatReview(review), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
