const Address = require('./address.model');

exports.getAddresses = async (req, res, next) => {
  try {
    const shopkeeperId = req.query.shopkeeperId;
    const filter = shopkeeperId ? { shopkeeper: shopkeeperId } : {};
    const addresses = await Address.find(filter).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      data: addresses,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const newAddress = await Address.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: newAddress,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Address not found', correlationId: req.correlationId });
    }
    res.json({ success: true, data: updated, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Address deleted', correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
