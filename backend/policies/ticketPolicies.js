
const isOwner = (ticket, user) => String(ticket.createdBy) === String(user._id);

class TicketPolicy {
  canViewAll() { return false; }
  canAccess(ticket, user) { return false; }
  canCreate() { return false; }
  canEditContent(ticket, user) { return false; }
  canDelete(ticket, user) { return false; }
  canSetStatus() { return false; }
}

// End User: owns ticket content (create, edit, delete own tickets)
class EndUserPolicy extends TicketPolicy {
  canAccess(ticket, user) { return isOwner(ticket, user); }
  canCreate() { return true; }
  canEditContent(ticket, user) { return isOwner(ticket, user); }
  canDelete(ticket, user) { return isOwner(ticket, user); }
}

// Agent: handles tickets (view all, change status/priority/assignee)
class AgentPolicy extends TicketPolicy {
  canViewAll() { return true; }
  canAccess() { return true; }
  canSetStatus() { return true; }
}

const POLICIES = { EndUser: EndUserPolicy, Agent: AgentPolicy };
const policyFor = (user) => new (POLICIES[user && user.role] || TicketPolicy)();

module.exports = { policyFor, TicketPolicy, EndUserPolicy, AgentPolicy };