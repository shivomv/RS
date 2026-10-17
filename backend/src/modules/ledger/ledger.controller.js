const { Ledger } = require('../../models');

function formatLedger(l) {
  const json = l.toJSON ? l.toJSON() : l;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(ledgers.map(formatLedger));
  } catch (err) {
    console.warn('[LedgerController] DB error:', err.message);
    return res.json([]);
  }
};
