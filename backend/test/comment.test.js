const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const { addComment } = require('../controllers/commentController');

describe('FR-08 Comment thread - addComment', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Checks ContentHandler allows valid comment text.
  it('TC-01: owner adds a valid comment and receives 201', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const ticket = { _id: ticketId, createdBy: userId };
    const comment = { _id: new mongoose.Types.ObjectId(), text: 'Printer still not working' };
    sinon.stub(Ticket, 'findById').resolves(ticket);
    const createStub = sinon.stub(Comment, 'create').resolves(comment);
    const req = {
      params: { id: ticketId.toString() },
      body: { text: 'Printer still not working' },
      user: { _id: userId, role: 'EndUser' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComment(req, res);

    expect(res.status.calledWith(201)).to.equal(true);
    expect(createStub.calledOnce).to.equal(true);
    expect(createStub.calledOnceWithMatch({ authorRole: 'EndUser', text: 'Printer still not working' })).to.equal(true);
  });

  // Checks ContentHandler rejects whitespace-only comment text.
  it('TC-02: owner posts only spaces and receives 400', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, createdBy: userId });
    const createStub = sinon.stub(Comment, 'create');
    const req = {
      params: { id: ticketId.toString() },
      body: { text: '   ' },
      user: { _id: userId, role: 'EndUser' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComment(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(createStub.notCalled).to.equal(true);
  });

  // Checks AccessHandler rejects a non-owner EndUser.
  it('TC-03: non-owner EndUser posts a valid comment and receives 403', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, createdBy: ownerId });
    const createStub = sinon.stub(Comment, 'create');
    const req = {
      params: { id: ticketId.toString() },
      body: { text: 'Printer still not working' },
      user: { _id: userId, role: 'EndUser' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComment(req, res);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(createStub.notCalled).to.equal(true);
  });

  // Checks TicketExistsHandler rejects a missing ticket.
  it('TC-04: missing ticket returns 404', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    sinon.stub(Ticket, 'findById').resolves(null);
    const createStub = sinon.stub(Comment, 'create');
    const req = {
      params: { id: ticketId.toString() },
      body: { text: 'Printer still not working' },
      user: { _id: userId, role: 'EndUser' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComment(req, res);

    expect(res.status.calledWith(404)).to.equal(true);
    expect(createStub.notCalled).to.equal(true);
  });

  // Checks ContentHandler rejects non-string text instead of crashing with 500.
  it('TC-13: non-string comment text returns 400', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, createdBy: userId });
    const createStub = sinon.stub(Comment, 'create');
    const req = {
      params: { id: ticketId.toString() },
      body: { text: 123 },
      user: { _id: userId, role: 'EndUser' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComment(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(createStub.notCalled).to.equal(true);
  });
});
