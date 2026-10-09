const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const { buildPostChain, buildReadChain } = require('../validators/commentChain');

// POST /api/tickets/:id/comments
// Adds a comment to a ticket after the request passes the validation chain.
const addComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }
    const ticket = await Ticket.findById(req.params.id);

    const error = buildPostChain().handle({ ticket, user: req.user, text: req.body.text });
    if (error) return res.status(error.status).json({ message: error.message });

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      authorRole: req.user.role,
      text: req.body.text.trim(),
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tickets/:id/comments
// Returns the comments of a ticket, oldest first.
const getComments = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }
    const ticket = await Ticket.findById(req.params.id);

    const error = buildReadChain().handle({ ticket, user: req.user });
    if (error) return res.status(error.status).json({ message: error.message });

    const comments = await Comment.find({ ticket: ticket._id })
      .sort({ createdAt: 1 })
      .populate('author', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addComment, getComments };
