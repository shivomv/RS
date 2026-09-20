const Review = require('./review.model');

exports.getReviews = async (req, res, next) => {
  try {
    const productId = req.query.productId;
    const filter = productId ? { product: productId } : {};
    const reviews = await Review.find(filter).populate('product').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
