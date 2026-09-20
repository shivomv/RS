const Ledger = require('./ledger.model');

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find().sort({ createdAt: -1 });
    return res.json(ledgers || []);
  } catch (err) {
    console.warn('[LedgerController] DB error:', err.message);
    return res.json([]);
  }
};
