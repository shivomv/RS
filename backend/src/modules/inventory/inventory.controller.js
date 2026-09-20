const InventoryBatch = require('./inventoryBatch.model');

exports.getBatches = async (req, res, next) => {
  try {
    const batches = await InventoryBatch.find().populate('product').sort({ createdAt: -1 });
    res.json({ success: true, data: batches, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.addBatch = async (req, res, next) => {
  try {
    const batch = await InventoryBatch.create(req.body);
    res.status(201).json({ success: true, data: batch, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
