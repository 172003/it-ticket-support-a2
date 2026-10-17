const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Ticket = require('../models/Ticket');
const { addTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { policyFor, TicketPolicy } = require('../policies/ticketPolicies');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

const ownerId = new mongoose.Types.ObjectId();
const otherId = new mongoose.Types.ObjectId();
const agentId = new mongoose.Types.ObjectId();

const endUser = { _id: ownerId, id: ownerId.toString(), role: 'EndUser' };
const otherUser = { _id: otherId, id: otherId.toString(), role: 'EndUser' };
const agent = { _id: agentId, id: agentId.toString(), role: 'Agent' };

const makeTicket = () => {
  const ticket = {
    _id: new mongoose.Types.ObjectId(),
    createdBy: ownerId,
    title: 'VPN not working',
    description: 'Cannot connect from home',
    status: 'In Progress',
    priority: 'Medium'
  };
  ticket.save = sinon.stub().resolves(ticket);
  ticket.deleteOne = sinon.stub().resolves();
  return ticket;
};

describe('IT-83 role-based ticket permissions (NFR-06)', () => {
  afterEach(() => sinon.restore());

  it('TC-20: Agent cannot create a ticket (403)', async () => {
    const createStub = sinon.stub(Ticket, 'create');
    const res = mockRes();
    await addTicket({ user: agent, body: { title: 'x', description: 'y' } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it('TC-21: End User can still create a ticket (201)', async () => {
    const created = { _id: new mongoose.Types.ObjectId(), title: 'x' };
    const createStub = sinon.stub(Ticket, 'create').resolves(created);
    const res = mockRes();
    await addTicket({ user: endUser, body: { title: 'x', description: 'y', priority: 'High' } }, res);
    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('TC-22: Agent cannot edit the title of a ticket (403)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await updateTicket({ user: agent, params: { id: ticket._id }, body: { title: 'Changed by agent' } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(ticket.save.called).to.be.false;
  });

  it('TC-23: Agent can still set status to Resolved (200, resolvedAt set)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    // the UI form also sends the unchanged title - this must still be allowed
    await updateTicket({ user: agent, params: { id: ticket._id }, body: { title: ticket.title, status: 'Resolved' } }, res);
    expect(res.status.called).to.be.false;
    expect(ticket.save.calledOnce).to.be.true;
    expect(ticket.status).to.equal('Resolved');
    expect(ticket.resolvedAt).to.be.instanceOf(Date);
  });

  it("TC-24: End User cannot edit another user's ticket (403)", async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await updateTicket({ user: otherUser, params: { id: ticket._id }, body: { title: 'Not mine' } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(ticket.save.called).to.be.false;
  });

  it('TC-25: End User can still edit their own ticket (200)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await updateTicket({ user: endUser, params: { id: ticket._id }, body: { title: 'VPN fails on Wi-Fi' } }, res);
    expect(res.status.called).to.be.false;
    expect(ticket.save.calledOnce).to.be.true;
    expect(ticket.title).to.equal('VPN fails on Wi-Fi');
  });

  it('TC-26: End User cannot change the status (403)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await updateTicket({ user: endUser, params: { id: ticket._id }, body: { status: 'Resolved' } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(ticket.save.called).to.be.false;
  });

  it('TC-27: Agent cannot delete a ticket (403)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await deleteTicket({ user: agent, params: { id: ticket._id } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(ticket.deleteOne.called).to.be.false;
  });

  it("TC-28: End User cannot delete another user's ticket (403)", async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await deleteTicket({ user: otherUser, params: { id: ticket._id } }, res);
    expect(res.status.calledWith(403)).to.be.true;
    expect(ticket.deleteOne.called).to.be.false;
  });

  it('TC-29: End User can still delete their own ticket (200)', async () => {
    const ticket = makeTicket();
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = mockRes();
    await deleteTicket({ user: endUser, params: { id: ticket._id } }, res);
    expect(ticket.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Ticket deleted' })).to.be.true;
  });

  it('TC-30: an unknown role is denied everything by the base policy', () => {
    const policy = policyFor({ role: 'Guest' });
    expect(policy).to.be.instanceOf(TicketPolicy);
    expect(policy.canCreate()).to.be.false;
    expect(policy.canSetStatus()).to.be.false;
    expect(policy.canDelete(makeTicket(), endUser)).to.be.false;
  });
});