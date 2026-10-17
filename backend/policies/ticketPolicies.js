

const isOwner = (ticket, user) => String(ticket.createdBy) === String(user._id);


class TicketPolicy {
  canViewAll() { return false; }
  canView(ticket, user) { return false; }
  canCreate() { return false; }
  canEditContent(ticket, user) { return false; }
  canDelete(ticket, user) { return false; }
  canSetStatus() { return false; }
}


class EndUserPolicy extends TicketPolicy {
  canView(ticket, user) { return isOwner(ticket, user); }
  canCreate() { return true; }
  canEditContent(ticket, user) { return isOwner(ticket, user); }
  canDelete(ticket, user) { return isOwner(ticket, user); }
}


class AgentPolicy extends TicketPolicy {
  canViewAll() { return true; }
  canView() { return true; }
  canSetStatus() { return true; }
}

const POLICIES = { EndUser: EndUserPolicy, Agent: AgentPolicy };
const policyFor = (user) => new (POLICIES[user && user.role] || TicketPolicy)();

module.exports = { policyFor, TicketPolicy, EndUserPolicy, AgentPolicy };