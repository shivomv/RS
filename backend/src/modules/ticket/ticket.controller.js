const { SupportTicket, Notification } = require('../../models');

function formatTicket(t) {
  const json = t.toJSON ? t.toJSON() : t;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.getTickets = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.isAdmin);

    const where = {};
    if (!isAdmin && user?.id) {
      where.shopkeeperId = user.id;
    } else if (req.query.shopkeeperId) {
      where.shopkeeperId = Number(req.query.shopkeeperId);
    }

    const tickets = await SupportTicket.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    return res.json(tickets.map(formatTicket));
  } catch (err) {
    console.warn('[TicketController] DB error:', err.message);
    return res.json([]);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const shopkeeperId = req.user?.id || req.body.shopkeeperId || null;
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const newTicket = await SupportTicket.create({
      ticketId,
      shopkeeperId,
      buyerName: req.user?.name || req.body.buyerName || 'Shopkeeper',
      subject: req.body.subject || 'Support Query',
      issueType: req.body.issueType || 'General Query',
      status: 'open',
      message: req.body.message,
      replies: [],
    });
    return res.status(201).json(formatTicket(newTicket));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to create support ticket' });
  }
};

exports.replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const replies = Array.isArray(ticket.replies) ? [...ticket.replies] : [];
    if (message && message.trim()) {
      replies.push({
        sender: 'admin',
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const newStatus = status || 'resolved';
    await ticket.update({
      status: newStatus,
      replies,
    });

    // Notify buyer about reply
    if (ticket.shopkeeperId) {
      await Notification.create({
        shopkeeperId: ticket.shopkeeperId,
        title: `Reply to Ticket #${ticket.ticketId}`,
        message: `Support team: "${(message || 'Your issue has been marked resolved').substring(0, 80)}..."`,
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Reply sent and saved successfully',
      ticket: formatTicket(ticket),
      reply: message,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to reply to ticket' });
  }
};
