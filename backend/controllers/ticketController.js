// Bring in the Ticket model we created earlier
const Ticket = require('../models/Ticket');

// FR-07: the close/reopen rules live in the state classes (State pattern)
const { stateFor } = require('../states/ticketStates');
const InvalidTransitionError = require('../errors/InvalidTransitionError');

// GET all tickets - returns tickets created by the logged-in user
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST a new ticket
const addTicket = async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const ticket = await Ticket.create({
      createdBy: req.user.id,
      title,
      description,
      priority
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a ticket
const updateTicket = async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'Agent' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit tickets you created' });
    }

    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    if (status !== undefined || priority !== undefined || assignedTo !== undefined) {
      if (req.user.role === 'Agent') {
        // FR-07: remember when the ticket was resolved (used for the 7-day reopen rule).
        // A ticket an Agent closes directly also needs a date, or it could never be reopened.
        if (status === 'Resolved' && ticket.status !== 'Resolved') {
          ticket.resolvedAt = new Date();
        } else if (status === 'Closed' && !ticket.resolvedAt) {
          ticket.resolvedAt = new Date();
        }
        ticket.status = status ?? ticket.status;
        ticket.priority = priority ?? ticket.priority;
        ticket.assignedTo = assignedTo ?? ticket.assignedTo;
      } else {
        return res.status(403).json({ message: 'Only Agents can change status, priority, or assignedTo' });
      }
    }
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FR-07: shared logic for close and reopen.
// action is 'close' or 'reopen'. The controller only checks WHO is asking (403);
// the state object decides whether the action is allowed (400).
const changeTicketState = (action) => async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: `Only the ticket owner can ${action} this ticket` });
    }

    stateFor(ticket)[action]();          // State pattern: ticket.status is changed inside the state class
    const savedTicket = await ticket.save();
    res.status(200).json(savedTicket);
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }
    res.status(500).json({ message: error.message });
  }
};

const closeTicket = changeTicketState('close');
const reopenTicket = changeTicketState('reopen');

module.exports = { getTickets, addTicket, updateTicket, deleteTicket, closeTicket, reopenTicket };