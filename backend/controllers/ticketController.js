// Bring in the Ticket model we created earlier
const Ticket = require('../models/Ticket');

// GET all tickets — returns tickets created by the logged-in user
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

module.exports = { getTickets, addTicket, updateTicket, deleteTicket };