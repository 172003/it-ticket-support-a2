const Ticket = require('../models/Ticket');


const { stateFor } = require('../states/ticketStates');
const InvalidTransitionError = require('../errors/InvalidTransitionError');


const { policyFor } = require('../policies/ticketPolicies');


const differs = (newValue, oldValue) =>
  newValue !== undefined && String(newValue) !== String(oldValue ?? '');


const getTickets = async (req, res) => {
  try {
    const filter = policyFor(req.user).canViewAll() ? {} : { createdBy: req.user.id };
    const tickets = await Ticket.find(filter).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addTicket = async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    if (!policyFor(req.user).canCreate()) {
      return res.status(403).json({ message: 'Your role is not allowed to create tickets' });
    }
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

const updateTicket = async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const policy = policyFor(req.user);
    if (!policy.canAccess(ticket, req.user)) {
    return res.status(403).json({ message: 'You do not have access to this ticket' });
      }

    const changesContent = differs(title, ticket.title) || differs(description, ticket.description);
    const changesHandling =
      differs(status, ticket.status) || differs(priority, ticket.priority) || differs(assignedTo, ticket.assignedTo);

    if (changesContent && !policy.canEditContent(ticket, req.user)) {
      return res.status(403).json({ message: 'Only the ticket owner can edit the title or description' });
    }
    if (changesHandling && !policy.canSetStatus()) {
      return res.status(403).json({ message: 'Only Agents can change status, priority, or assignedTo' });
    }

    if (changesContent) {
      ticket.title = title || ticket.title;
      ticket.description = description || ticket.description;
    }
    if (changesHandling) {


      if (status === 'Resolved' && ticket.status !== 'Resolved') {
        ticket.resolvedAt = new Date();
      } else if (status === 'Closed' && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
      ticket.status = status ?? ticket.status;
      ticket.priority = priority ?? ticket.priority;
      ticket.assignedTo = assignedTo ?? ticket.assignedTo;
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!policyFor(req.user).canDelete(ticket, req.user)) {
      return res.status(403).json({ message: 'You are not allowed to delete this ticket' });
    }

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const changeTicketState = (action) => async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: `Only the ticket owner can ${action} this ticket` });
    }

           stateFor(ticket)[action]();             
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