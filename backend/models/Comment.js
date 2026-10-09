const mongoose = require('mongoose');

// A comment belongs to one ticket and is written by one user.
const commentSchema = new mongoose.Schema({
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorRole: { type: String, enum: ['EndUser', 'Agent'], required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
