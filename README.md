# IT Ticket Support System

A web application that gives CyberWave IT Support a central place to log, assign, track and resolve IT support requests, replacing scattered email and phone requests.

Built for QUT IFN636 Software Life Cycle Management (Assessment 2). The Assessment 1 version is preserved at tag `v1.0`.

**Team:** Mohika Manjunatha Rao, Thanathip Naphanang

## Features

| ID | Feature |
| --- | --- |
| FR-01 | A logged-in user creates a ticket (title, description, priority) |
| FR-02 | A user sees only the tickets they created |
| FR-06 | Only Agents can change status, priority and assignee; only the creator can edit title and description |

Work in progress is tracked in [Jira](https://mohikaqut.atlassian.net/jira/software/projects/IT/boards/5/backlog). Add a feature to this table in the pull request that delivers it.

## Roles

- **EndUser**: creates tickets and edits the title and description of their own tickets.
- **Agent**: changes the status, priority and assignee of any ticket.

New accounts register as `EndUser`. An Agent account is created by changing the `role` field of the user in the database.

## Tech stack

- **Frontend:** React
- **Backend:** Node.js, Express, JWT authentication
- **Database:** MongoDB Atlas with Mongoose
- **Testing:** Mocha, Chai, Sinon

## API endpoints

Ticket endpoints require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Who |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create an account | Everyone |
| POST | `/api/auth/login` | Log in and receive a JWT | Everyone |
| GET | `/api/auth/profile` | Get the logged-in user's profile | Logged in |
| PUT | `/api/auth/profile` | Update the profile | Logged in |
| POST | `/api/tickets` | Create a ticket | Logged in |
| GET | `/api/tickets` | List the logged-in user's tickets | Logged in |
| PUT | `/api/tickets/:id` | Update a ticket (role rules apply) | Owner or Agent |
| DELETE | `/api/tickets/:id` | Delete a ticket | Logged in |

Common responses: 401 missing or invalid token, 403 not allowed, 404 ticket not found.

## Getting started

### Prerequisites

- Node.js 18 or later
- A MongoDB Atlas connection string

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5001
```

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Run the tests

```bash
cd backend
npm run test
```

Never commit `.env`. It is listed in `.gitignore`.

## Git workflow

- Branch names: `<Jira-ID>-<short-description>`, for example `IT-66-comments`.
- Commit messages: `<Jira-ID>: <description>`.
- Every change reaches `main` through a pull request reviewed by the other member.
- A pull request that adds a feature or an endpoint also updates this README.

## Known limitations

- The frontend still uses the starter Task pages, so tickets cannot be used from the UI yet.
- Agent accounts are created by changing the `role` field in the database; there is no agent registration.
- Any logged-in user can delete any ticket; the delete endpoint has no ownership check.
- The application is not deployed yet.

## Project links

- Jira: https://mohikaqut.atlassian.net/jira/software/projects/IT/boards/5/backlog
- Repository: https://github.com/172003/it-ticket-support-a2

Ticket endpoints require the header `Authorization: Bearer <token>`.
Method	Endpoint	Description	Who
POST	`/api/auth/register`	Create an account	Everyone
POST	`/api/auth/login`	Log in and receive a JWT	Everyone
GET	`/api/auth/profile`	Get the logged-in user's profile	Logged in
PUT	`/api/auth/profile`	Update the profile	Logged in
POST	`/api/tickets`	Create a ticket	Logged in
GET	`/api/tickets`	List the logged-in user's tickets	Logged in
PUT	`/api/tickets/:id`	Update a ticket (role rules apply)	Owner or Agent
DELETE	`/api/tickets/:id`	Delete a ticket	Logged in
Common responses: 401 missing or invalid token, 403 not allowed, 404 ticket not found.
Getting started
Prerequisites
Node.js 18 or later
A MongoDB Atlas connection string
Backend
```bash
cd backend
npm install
```
Create `backend/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5001
```
```bash
npm start
```
Frontend
```bash
cd frontend
npm install
npm start
```
Run the tests
```bash
cd backend
npm run test
```
Never commit `.env`. It is listed in `.gitignore`.
Git workflow
Branch names: `<Jira-ID>-<short-description>`, for example `IT-66-comments`.
Commit messages: `<Jira-ID>: <description>`.
Every change reaches `main` through a pull request reviewed by the other member.
A pull request that adds a feature or an endpoint also updates this README.
Known limitations
The frontend still uses the starter Task pages, so tickets cannot be used from the UI yet.
Agent accounts are created by changing the `role` field in the database; there is no agent registration.
Any logged-in user can delete any ticket; the delete endpoint has no ownership check.
The application is not deployed yet.
Project links
Jira: https://mohikaqut.atlassian.net/jira/software/projects/IT/boards/5/backlog
Repository: https://github.com/172003/it-ticket-support-a2
