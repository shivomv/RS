const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { optionalAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.get('/', optionalAuth, ticketController.getTickets);
router.post('/', optionalAuth, ticketController.createTicket);
router.post('/:id/reply', requireAdmin, ticketController.replyTicket);

module.exports = router;
