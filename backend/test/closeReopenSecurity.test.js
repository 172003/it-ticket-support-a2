// NFR-06 (IT-68): 401 and 403 on the close and reopen endpoints.
// These tests go through the real Express app and routes, so they also prove
// that the 'protect' middleware is wired to PATCH /:id/close and /:id/reopen.
// The database and JWT check are stubbed with Sinon, so no connection is needed.

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../server');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

chai.use(chaiHttp);
const { expect } = chai;

const ticketId = new mongoose.Types.ObjectId().toString();
const ownerId = new mongoose.Types.ObjectId();
const strangerId = new mongoose.Types.ObjectId();

// Pretend the token is valid and belongs to the given user.
const loginAs = (user) => {
  sinon.stub(jwt, 'verify').returns({ id: user._id.toString() });
  sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(user) });
};

describe('NFR-06 Security - 401/403 on close and reopen endpoints', () => {
  afterEach(() => {
    sinon.restore();
  });

  [['close', 14], ['reopen', 17]].forEach(([action, firstId]) => {
    // Checks protect() blocks a request that has no Authorization header.
    it(`TC-${firstId}: PATCH /${action} without a token receives 401`, async () => {
      const res = await chai.request(app).patch(`/api/tickets/${ticketId}/${action}`);
      expect(res).to.have.status(401);
    });

    // Checks protect() blocks a token that fails jwt.verify.
    it(`TC-${firstId + 1}: PATCH /${action} with an invalid token receives 401`, async () => {
      sinon.stub(jwt, 'verify').throws(new Error('invalid signature'));
      const res = await chai
        .request(app)
        .patch(`/api/tickets/${ticketId}/${action}`)
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res).to.have.status(401);
    });

    // Checks the owner-only rule: even an Agent cannot close or reopen someone else's ticket.
    it(`TC-${firstId + 2}: PATCH /${action} by a user who does not own the ticket receives 403`, async () => {
      loginAs({ _id: strangerId, role: 'Agent' });
      const save = sinon.spy();
      sinon.stub(Ticket, 'findById').resolves({
        _id: ticketId,
        status: 'Resolved',
        resolvedAt: new Date(),
        createdBy: ownerId,
        save,
      });

      const res = await chai
        .request(app)
        .patch(`/api/tickets/${ticketId}/${action}`)
        .set('Authorization', 'Bearer valid-token');

      expect(res).to.have.status(403);
      expect(save.called).to.equal(false);
    });
  });
});
