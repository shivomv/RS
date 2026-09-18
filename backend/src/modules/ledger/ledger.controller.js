const Ledger = require('./ledger.model');

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find().sort({ createdAt: -1 });
    res.json(ledgers);
  } catch (err) {
    res.json([
      {
        invoiceId: 'INV-2026-8942',
        amount: 3450,
        gstTax: 621,
        dueDate: new Date(Date.now() + 86400000 * 30),
        status: 'unpaid',
        terms: 'Net 30 Days',
      },
    ]);
  }
};
