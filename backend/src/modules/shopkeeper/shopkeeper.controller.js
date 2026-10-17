const { Shopkeeper } = require('../../models');

function formatShopkeeper(s) {
  const json = s.toJSON ? s.toJSON() : s;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getShopkeepers = async (req, res) => {
  try {
    const shops = await Shopkeeper.findAll();
    res.json(shops.map(formatShopkeeper));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createShopkeeper = async (req, res) => {
  try {
    const shop = await Shopkeeper.create(req.body);
    res.status(201).json(formatShopkeeper(shop));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
