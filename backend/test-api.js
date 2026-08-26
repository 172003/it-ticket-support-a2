const BASE = 'http://localhost:5001/api';

async function registerUser(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  console.log(`Register ${email}:`, res.status, data);
  return data;
}

async function loginUser(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log(`Login ${email}:`, res.status, data.token ? 'got token' : data);
  return data.token;
}

async function createTicket(token, title, description) {
  const res = await fetch(`${BASE}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, priority: 'Low' })
  });
  const data = await res.json();
  console.log('Create ticket:', res.status, data);
  return data;
}

async function updateTicket(token, ticketId, updates) {
  const res = await fetch(`${BASE}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  console.log('Update ticket:', res.status, data);
  return data;
}

async function main() {
  await registerUser('Test EndUser', 'enduser@test.com', 'password123');
  await registerUser('Test Agent', 'agent@test.com', 'password123');
  const endUserToken = await loginUser('enduser@test.com', 'password123');
  const agentToken = await loginUser('agent@test.com', 'password123');
  const ticket = await createTicket(endUserToken, 'Test ticket', 'Something broke');
  await updateTicket(endUserToken, ticket._id, { status: 'In Progress' });
  await updateTicket(agentToken, ticket._id, { status: 'In Progress' });
}

main();