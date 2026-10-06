// backend/test/closeReopen.test.js
// FR-07 (close / reopen ticket) - unit tests.
// No database needed: the Ticket model is stubbed with Sinon.

const { expect } = require('chai');
const sinon = require('sinon');

const Ticket = require('../models/Ticket');
const { stateFor } = require('../states/ticketStates');
const InvalidTransitionError = require('../errors/InvalidTransitionError');
const { closeTicket, reopenTicket } = require('../controllers/ticketController');

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);

// A fake ticket document: only the fields and methods the code uses.
const makeTicket = (status, ownerId = 'owner1', resolvedAt) => ({
  status,
  resolvedAt,
  createdBy: { toString: () => ownerId },
  save: sinon.spy(async function () { return this; }),
});

// A fake Express response that records the status code and body.
const makeRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.spy();
  return res;
};

const owner = { _id: { toString: () => 'owner1' }, role: 'EndUser' };
const stranger = { _id: { toString: () => 'someoneElse' }, role: 'Agent' };

afterEach(() => sinon.restore());

// ---------------------------------------------------------------------------
// TC-05: closing a ticket (state classes)
// ---------------------------------------------------------------------------
describe('TC-05: close ticket (State pattern)', () => {
  it('closes a Resolved ticket', () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(1));
    stateFor(ticket).close();
    expect(ticket.status).to.equal('Closed');
  });

  ['Open', 'In Progress', 'Closed'].forEach((status) => {
    it(`rejects closing a ${status} ticket with InvalidTransitionError`, () => {
      const ticket = makeTicket(status, 'owner1', daysAgo(1));
      expect(() => stateFor(ticket).close()).to.throw(InvalidTransitionError);
      expect(ticket.status).to.equal(status); // status unchanged
    });
  });
});

// ---------------------------------------------------------------------------
// TC-06: reopening a ticket (7-day window)
// ---------------------------------------------------------------------------
describe('TC-06: reopen ticket within 7 days', () => {
  it('reopens a Resolved ticket resolved 2 days ago', () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(2));
    stateFor(ticket).reopen();
    expect(ticket.status).to.equal('Open');
  });

  it('reopens a Closed ticket resolved 6 days ago', () => {
    const ticket = makeTicket('Closed', 'owner1', daysAgo(6));
    stateFor(ticket).reopen();
    expect(ticket.status).to.equal('Open');
  });

  it('rejects reopening after 7 days', () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(8));
    expect(() => stateFor(ticket).reopen()).to.throw(InvalidTransitionError, /7-day/);
    expect(ticket.status).to.equal('Resolved');
  });

  it('rejects reopening when there is no resolvedAt date', () => {
    const ticket = makeTicket('Closed', 'owner1', undefined);
    expect(() => stateFor(ticket).reopen()).to.throw(InvalidTransitionError);
  });

  ['Open', 'In Progress'].forEach((status) => {
    it(`rejects reopening a ${status} ticket`, () => {
      const ticket = makeTicket(status, 'owner1', daysAgo(1));
      expect(() => stateFor(ticket).reopen()).to.throw(InvalidTransitionError);
    });
  });
});

// ---------------------------------------------------------------------------
// TC-07: endpoints return the right HTTP codes (controller)
// ---------------------------------------------------------------------------
describe('TC-07: close/reopen controller responses', () => {
  it('returns 200 and saves when the owner closes a Resolved ticket', async () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(1));
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await closeTicket({ params: { id: 't1' }, user: owner }, res);

    expect(res.status.calledWith(200)).to.equal(true);
    expect(ticket.status).to.equal('Closed');
    expect(ticket.save.calledOnce).to.equal(true);
  });

  it('returns 400 when the owner closes an Open ticket', async () => {
    const ticket = makeTicket('Open', 'owner1');
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await closeTicket({ params: { id: 't1' }, user: owner }, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(ticket.save.called).to.equal(false);
  });

  it('returns 200 when the owner reopens within 7 days', async () => {
    const ticket = makeTicket('Closed', 'owner1', daysAgo(2));
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await reopenTicket({ params: { id: 't1' }, user: owner }, res);

    expect(res.status.calledWith(200)).to.equal(true);
    expect(ticket.status).to.equal('Open');
  });

  it('returns 400 when the owner reopens after 7 days', async () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(8));
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await reopenTicket({ params: { id: 't1' }, user: owner }, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(ticket.save.called).to.equal(false);
  });

  it('returns 403 and does not save when a non-owner closes the ticket', async () => {
    const ticket = makeTicket('Resolved', 'owner1', daysAgo(1));
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await closeTicket({ params: { id: 't1' }, user: stranger }, res);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(ticket.status).to.equal('Resolved');
    expect(ticket.save.called).to.equal(false);
  });

  it('returns 403 when a non-owner reopens the ticket', async () => {
    const ticket = makeTicket('Closed', 'owner1', daysAgo(1));
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const res = makeRes();

    await reopenTicket({ params: { id: 't1' }, user: stranger }, res);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(ticket.status).to.equal('Closed');
  });

  it('returns 404 when the ticket does not exist', async () => {
    sinon.stub(Ticket, 'findById').resolves(null);
    const res = makeRes();

    await closeTicket({ params: { id: 'missing' }, user: owner }, res);

    expect(res.status.calledWith(404)).to.equal(true);
  });
});