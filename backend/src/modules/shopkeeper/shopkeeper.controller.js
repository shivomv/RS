const Shopkeeper = require('./shopkeeper.model');

exports.getShopkeepers = async (req, res) => {
  try {
    const shops = await Shopkeeper.find();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createShopkeeper = async (req, res) => {
  try {
    const shop = new Shopkeeper(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
