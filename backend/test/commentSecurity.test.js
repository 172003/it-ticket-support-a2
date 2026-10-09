const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');
const { getComments } = require('../controllers/commentController');

const makeRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('NFR-06 Security - 401/403 on the comment endpoints', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Checks protect() blocks a request that has no Authorization header.
  it('TC-08: request without a token receives 401', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = sinon.spy();

    await protect(req, res, next);

    expect(res.status.calledWith(401)).to.equal(true);
    expect(next.notCalled).to.equal(true);
  });

  // Checks protect() blocks a token that fails jwt.verify.
  it('TC-09: request with an invalid token receives 401', async () => {
    sinon.stub(jwt, 'verify').throws(new Error('invalid signature'));
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = makeRes();
    const next = sinon.spy();

    await protect(req, res, next);

    expect(res.status.calledWith(401)).to.equal(true);
    expect(next.notCalled).to.equal(true);
  });

  // Checks AccessHandler on the read chain rejects a non-owner EndUser.
  it('TC-10: non-owner EndUser reading comments receives 403', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, createdBy: new mongoose.Types.ObjectId() });
    const findStub = sinon.stub(Comment, 'find');
    const req = { params: { id: ticketId.toString() }, user: { _id: new mongoose.Types.ObjectId(), role: 'EndUser' } };
    const res = makeRes();

    await getComments(req, res);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(findStub.notCalled).to.equal(true);
  });

  // Checks an Agent may read comments on a ticket they did not create.
  it('TC-11: Agent reading comments on any ticket receives the list', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const comments = [{ text: 'First' }, { text: 'Second' }];
    sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, createdBy: new mongoose.Types.ObjectId() });
    sinon.stub(Comment, 'find').returns({
      sort: sinon.stub().returnsThis(),
      populate: sinon.stub().resolves(comments),
    });
    const req = { params: { id: ticketId.toString() }, user: { _id: new mongoose.Types.ObjectId(), role: 'Agent' } };
    const res = makeRes();

    await getComments(req, res);

    expect(res.json.calledWith(comments)).to.equal(true);
    expect(res.status.called).to.equal(false);
  });

  // Checks a malformed ticket id is rejected before any database call.
  it('TC-12: malformed ticket id returns 400', async () => {
    const findStub = sinon.stub(Ticket, 'findById');
    const req = { params: { id: 'abc' }, user: { _id: new mongoose.Types.ObjectId(), role: 'Agent' } };
    const res = makeRes();

    await getComments(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(findStub.notCalled).to.equal(true);
  });
});
