IT Ticket Support System

A web application that gives CyberWave IT Support a central place to log, assign, track and resolve IT support requests, replacing scattered email and phone requests.

Built for QUT IFN636 Software Life Cycle Management (Assessment 2).

Team: Mohika Manjunatha Rao, Thanathip Naphanang

Features
ID	Feature	Status
FR-01	End User creates a ticket (title, description, category, priority)	Baseline (A1)
FR-02	End User views only their own tickets	Baseline (A1)
FR-06	Only Agents can change status, priority and assignee	Baseline (A1)
FR-07	End User closes or reopens their own ticket (reopen within 7 days of resolution)	New in A2
FR-08	Comment thread on each ticket (End User who owns it, and Agents)	New in A2

Planned for a later release: agent self-assignment, resolution notes, field validation, keyword search and filtering, in-app notifications.

Tech stack
Frontend: React
Backend: Node.js, Express, JWT authentication
Database: MongoDB Atlas with Mongoose
Testing: Mocha, Chai, Sinon (unit), Postman (API), Apache Benchmark (load)
Deployment: AWS EC2 x2 (Nginx + PM2) behind an Application Load Balancer, CloudWatch monitoring
CI/CD: GitHub Actions
Design patterns and OOP
State pattern (FR-07): backend/states/ticketStates.js holds one class per ticket status (OpenState, InProgressState, ResolvedState, ClosedState). Each class decides whether a close or reopen is allowed. Invalid actions throw InvalidTransitionError, which the API returns as HTTP 400.
Chain of Responsibility (FR-08): backend/validators/commentChain.js validates a comment in order: ticket exists, user allowed, text length.
Encapsulation: the controllers never set a ticket's status directly; they call close() or reopen() on the current state object.
API endpoints
Method	Endpoint	Description	Who
POST	/api/auth/login	Log in and receive a JWT	Everyone
POST	/api/tickets	Create a ticket	End User
GET	/api/tickets	List tickets (own tickets for End Users, all for Agents)	Logged in
PATCH	/api/tickets/:id/close	Close a Resolved ticket	Ticket owner
PATCH	/api/tickets/:id/reopen	Reopen within 7 days of resolution	Ticket owner
POST	/api/tickets/:id/comments	Add a comment (1 to 1000 characters)	Owner or Agent
GET	/api/tickets/:id/comments	Read comments, oldest first	Owner or Agent
GET	/api/health	Health check (used by the load balancer)	Public

Common responses: 400 invalid action or input, 401 missing or invalid token, 403 not allowed, 404 ticket not found.

Getting started
Prerequisites
Node.js 18 or later
A MongoDB Atlas connection string
Backend
bash
cd backend
npm install

Create backend/.env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5001
bash
npm start
Frontend
bash
cd frontend
npm install
npm start
Run the tests
bash
cd backend
npm run test

Never commit .env. It is listed in .gitignore.

Deployment

Every push to main triggers GitHub Actions: the test job runs first, and the deploy job only runs if all tests pass. The app runs on two EC2 instances behind an Application Load Balancer, which health-checks /api/health.

Live URL: [ALB DNS name]

Known limitations
No auto-scaling (two instances are provisioned manually)
Agent accounts are pre-seeded; there is no agent registration
Comments cannot be edited or deleted
Features listed under "planned" above are not implemented yet
Project links
Jira: https://mohikaqut.atlassian.net/jira/software/projects/IT/boards/5/backlog
Repository: https://github.com/172003/it-ticket-support-a2
