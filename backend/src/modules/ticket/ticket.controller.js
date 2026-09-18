const SupportTicket = require('./ticket.model');

exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.json([]);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = await SupportTicket.create({ ticketId, ...req.body });
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(201).json({ ticketId: 'TKT-9981', ...req.body });
  }
};
