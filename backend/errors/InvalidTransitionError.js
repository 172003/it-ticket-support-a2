// backend/errors/InvalidTransitionError.js
// Thrown by a ticket state when a close/reopen action is not allowed.
// The controller maps it to HTTP 400.

class InvalidTransitionError extends Error {
  constructor(message = 'Invalid status change') {
    super(message);
    this.name = 'InvalidTransitionError';
    this.statusCode = 400;
  }
}

module.exports = InvalidTransitionError;