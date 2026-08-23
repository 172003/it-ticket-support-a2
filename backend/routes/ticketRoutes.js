// Bring in Express, the framework used to define API routes
const express = require('express');

// Import the four ticket functions we're about to write in ticketController.js
const { getTickets, addTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');

// Import the 'protect' function, which checks the user is logged in before allowing access
const { protect } = require('../middleware/authMiddleware');

// Create a router — a mini controller that holds all the ticket-related endpoints
const router = express.Router();

// Base URL (e.g. /api/tickets/):
// GET request → check login, then return the ticket list
// POST request → check login, then create a new ticket
router.route('/').get(protect, getTickets).post(protect, addTicket);

// URL with a specific ticket ID (e.g. /api/tickets/64abc123):
// PUT request → check login, then update that ticket
// DELETE request → check login, then delete that ticket
router.route('/:id').put(protect, updateTicket).delete(protect, deleteTicket);

// Make this router available for server.js to use
module.exports = router;