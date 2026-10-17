const { SupportTicket } = require('../../models');

function formatTicket(t) {
  const json = t.toJSON ? t.toJSON() : t;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(tickets.map(formatTicket));
  } catch (err) {
    console.warn('[TicketController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = await SupportTicket.create({ ticketId, ...req.body });
    res.status(201).json(formatTicket(newTicket));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create support ticket' });
  }
};
