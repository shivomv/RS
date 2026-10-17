const { InventoryBatch, Product } = require('../../models');

function formatBatch(b) {
  const json = b.toJSON ? b.toJSON() : b;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getBatches = async (req, res, next) => {
  try {
    const batches = await InventoryBatch.findAll({
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: batches.map(formatBatch), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.addBatch = async (req, res, next) => {
  try {
    const batch = await InventoryBatch.create(req.body);
    res.status(201).json({ success: true, data: formatBatch(batch), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
