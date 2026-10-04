// backend/states/ticketStates.js
// State pattern for FR-07 (close / reopen).
// Encapsulation: the transition rules and the 7-day window live inside these
// classes. The controller only calls close() or reopen(); it never sets
// ticket.status itself.

const InvalidTransitionError = require('../errors/InvalidTransitionError');

const REOPEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Base state: every action is rejected unless a subclass overrides it.
class TicketState {
  constructor(ticket) {
    this.ticket = ticket;
  }

  close() {
    throw new InvalidTransitionError(`Cannot close a ticket that is ${this.ticket.status}`);
  }

  reopen() {
    throw new InvalidTransitionError(`Cannot reopen a ticket that is ${this.ticket.status}`);
  }

  // Shared by ResolvedState and ClosedState.
  reopenWithinWindow(now = new Date()) {
    if (!this.ticket.resolvedAt) {
      throw new InvalidTransitionError('Ticket has no resolution date');
    }
    if (now - this.ticket.resolvedAt > REOPEN_WINDOW_MS) {
      throw new InvalidTransitionError('The 7-day reopen window has passed');
    }
    this.ticket.status = 'Open';
  }
}

class OpenState extends TicketState {}
class InProgressState extends TicketState {}

class ResolvedState extends TicketState {
  close() {
    this.ticket.status = 'Closed';
  }
  reopen() {
    this.reopenWithinWindow();
  }
}

class ClosedState extends TicketState {
  reopen() {
    this.reopenWithinWindow();
  }
}

const STATES = {
  'Open': OpenState,
  'In Progress': InProgressState,
  'Resolved': ResolvedState,
  'Closed': ClosedState,
};

// Factory: returns the state object that matches the ticket's current status.
const stateFor = (ticket) => {
  const StateClass = STATES[ticket.status];
  if (!StateClass) {
    throw new InvalidTransitionError(`Unknown ticket status: ${ticket.status}`);
  }
  return new StateClass(ticket);
};

module.exports = {
  stateFor,
  TicketState,
  OpenState,
  InProgressState,
  ResolvedState,
  ClosedState,
  REOPEN_WINDOW_MS,
};