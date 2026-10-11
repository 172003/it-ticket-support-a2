// Creates a test/demo Agent account. Run once: node seedAgent.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');

dotenv.config();

const AGENT = { name: 'Demo Agent', email: 'agent@example.com', password: 'Agent123!', role: 'Agent' };

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: AGENT.email });
    if (existing) {
      console.log(`Agent already exists: ${AGENT.email}`);
    } else {
      await User.create(AGENT);
      console.log(`Agent created: ${AGENT.email} / ${AGENT.password}`);
    }
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
