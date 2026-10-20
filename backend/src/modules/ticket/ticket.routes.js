const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.post('/:id/reply', ticketController.replyTicket);

module.exports = router;
