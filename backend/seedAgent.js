// backend/seedAgent.js
// Creates (or promotes) a demo Agent account (IT-69).
// Agents cannot register through the app, so this script sets the role directly.
//
// Usage, from the backend folder:
//   1. Add SEED_AGENT_PASSWORD (and optionally SEED_AGENT_EMAIL) to backend/.env. Never commit that file.
//   2. Run:  npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const EMAIL = process.env.SEED_AGENT_EMAIL || 'agent@example.com';
const PASSWORD = process.env.SEED_AGENT_PASSWORD;

if (!MONGO_URI || !PASSWORD) {
  console.error('Set MONGO_URI and SEED_AGENT_PASSWORD in backend/.env first.');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: EMAIL });
    if (existing) {
      existing.role = 'Agent';           // the password is not changed
      await existing.save();
      console.log(`Existing user ${EMAIL} now has the Agent role.`);
    } else {
      await User.create({ name: 'Demo Agent', email: EMAIL, password: PASSWORD, role: 'Agent' });
      console.log(`Agent account created: ${EMAIL}`);
    }
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
