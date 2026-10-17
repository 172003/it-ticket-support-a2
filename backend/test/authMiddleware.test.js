const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe('IT-83 protect middleware (401 cases, NFR-06)', () => {
  const SECRET = 'test-secret';
  let oldSecret;

  before(() => {
    oldSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = SECRET;
  });
  after(() => {
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
  });
  afterEach(() => sinon.restore());

  it('TC-31: no Authorization header returns 401 once', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = sinon.spy();
    await protect(req, res, next);
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('TC-32: an invalid token returns 401 once', async () => {
    const req = { headers: { authorization: 'Bearer not.a.realtoken' } };
    const res = mockRes();
    const next = sinon.spy();
    await protect(req, res, next);
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('TC-33: "Bearer " with an empty token returns 401 exactly once', async () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = mockRes();
    const next = sinon.spy();
    await protect(req, res, next);
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.calledWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('TC-34: a valid token for a deleted user returns 401', async () => {
    const id = new mongoose.Types.ObjectId();
    const token = jwt.sign({ id }, SECRET);
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(null) });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = sinon.spy();
    await protect(req, res, next);
    expect(res.status.calledOnceWith(401)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('TC-35: a valid token for an existing user calls next() and sets req.user', async () => {
    const user = { _id: new mongoose.Types.ObjectId(), role: 'EndUser' };
    const token = jwt.sign({ id: user._id }, SECRET);
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(user) });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = sinon.spy();
    await protect(req, res, next);
    expect(next.calledOnce).to.be.true;
    expect(req.user).to.equal(user);
    expect(res.status.called).to.be.false;
  });
});