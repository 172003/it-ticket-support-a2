const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    // FR-07: set when an Agent changes the status to Resolved.
    // The 7-day reopen window is measured from this date.
    resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);