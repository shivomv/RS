const { Address } = require('../../models');

function formatAddress(a) {
  const json = a.toJSON ? a.toJSON() : a;
  return {
    ...json,
    streetAddress: json.fullAddress || json.streetAddress || '',
    _id: String(json.id),
  };
}

exports.getAddresses = async (req, res, next) => {
  try {
    let shopkeeperId = req.query.shopkeeperId;
    if (!shopkeeperId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      shopkeeperId = req.headers.authorization.substring(7);
    }

    const where = {};
    if (shopkeeperId && !isNaN(Number(shopkeeperId))) {
      where.shopkeeperId = Number(shopkeeperId);
    }

    const addresses = await Address.findAll({
      where,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: addresses.map(formatAddress),
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const addressData = { ...req.body };
    if (!addressData.fullAddress && addressData.streetAddress) {
      addressData.fullAddress = addressData.streetAddress;
    }
    if (!addressData.shopkeeperId && addressData.shopkeeper) {
      addressData.shopkeeperId = Number(addressData.shopkeeper) || null;
    }
    if (!addressData.shopkeeperId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      addressData.shopkeeperId = Number(req.headers.authorization.substring(7)) || null;
    }

    const newAddress = await Address.create(addressData);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: formatAddress(newAddress),
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found', correlationId: req.correlationId });
    }
    await address.update(req.body);
    res.json({ success: true, data: formatAddress(address), correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (address) {
      await address.destroy();
    }
    res.json({ success: true, message: 'Address deleted', correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
};
