// Chain of Responsibility for FR-08 (comment thread).
// Each handler does one check. It returns an error object { status, message }
// or passes the request context to the next handler. null means every check passed.

class Handler {
  setNext(handler) {
    this.next = handler;
    return handler;
  }

  handle(ctx) {
    return this.next ? this.next.handle(ctx) : null;
  }
}

// 404 when the ticket does not exist
class TicketExistsHandler extends Handler {
  handle(ctx) {
    if (!ctx.ticket) return { status: 404, message: 'Ticket not found' };
    return super.handle(ctx);
  }
}

// 403 unless the user is an Agent or created the ticket
class AccessHandler extends Handler {
  handle(ctx) {
    const isAgent = ctx.user.role === 'Agent';
    const isOwner = String(ctx.ticket.createdBy) === String(ctx.user._id);
    if (!isAgent && !isOwner) return { status: 403, message: 'Not allowed to access comments on this ticket' };
    return super.handle(ctx);
  }
}

// 400 unless the text has 1 to 1000 characters after trimming
class ContentHandler extends Handler {
  handle(ctx) {
    const length = (ctx.text || '').trim().length;
    if (length < 1 || length > 1000) return { status: 400, message: 'Comment must be 1-1000 characters' };
    return super.handle(ctx);
  }
}

// Posting a comment: ticket exists -> user allowed -> text valid
const buildPostChain = () => {
  const first = new TicketExistsHandler();
  first.setNext(new AccessHandler()).setNext(new ContentHandler());
  return first;
};

// Reading comments: ticket exists -> user allowed
const buildReadChain = () => {
  const first = new TicketExistsHandler();
  first.setNext(new AccessHandler());
  return first;
};

module.exports = { Handler, TicketExistsHandler, AccessHandler, ContentHandler, buildPostChain, buildReadChain };
