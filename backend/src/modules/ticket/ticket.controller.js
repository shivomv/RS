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

exports.replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    await ticket.update({ status: 'resolved' });
    return res.json({
      success: true,
      message: 'Reply sent successfully',
      ticket: formatTicket(ticket),
      reply: message,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to reply to ticket' });
  }
};
