# IT Support Ticket System

## Overview
An IT support ticket management system built for QUT IFN636 Assessment 1, adapted from the Tutorial 4 `taskmanagerv1` starter (Task domain → Ticket domain). It provides a user-friendly interface for submitting, viewing, and managing support tickets, with role-based access control distinguishing between EndUsers and Agents.

## Features
- Secure user authentication (signup, login, logout)
- Profile management
- Create, view, update, and delete support tickets
- Role-based permissions:
  - **EndUser** — can create tickets and edit the title/description of tickets they created
  - **Agent** — can update ticket status, priority, and assignment on any ticket

## Architecture
- **Frontend:** React
- **Backend:** Node.js / Express
- **Database:** MongoDB Atlas
- **Auth:** JWT-based; a `role` field on the User model (`EndUser` / `Agent`) drives access control
- **Structure:** Routes → Controllers → Models pattern

## Setup (local development)
### Prerequisites
- [Node.js](https://nodejs.org/en)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)
- A [MongoDB Atlas](https://account.mongodb.com/account/login) account and database
- A [GitHub](https://github.com/signup) account

### Steps
1. Clone the repo:
git clone https://github.com/172003/IT-Support-Ticket-System.git

2. Backend setup:
cd backend
npm install

3. Create a `.env` file in `backend/` (see `.env.example` for the required variables: `MONGO_URI`, `JWT_SECRET`, `PORT`).
   
4. Run the backend:
node server.js

5. Frontend setup (in a separate terminal):
cd frontend
npm install
npm start


## Deployment
- Deployed on AWS EC2 — public URL: **[fill in after deployment]**
- Manual deployment process (no CI/CD) — documented in [deployment section / link, to be added]

## Known limitations
- New users always register as `EndUser` by default; promoting a user to `Agent` currently requires manually updating the `role` field in the database (no admin UI yet)
- [Add any other real limitations you're aware of]

## Links
- Jira: **[your link]**
- Figma: **[your link]**
- Draw.io: **[your link]**
- GitHub: https://github.com/172003/IT-Support-Ticket-System


## Deployment
- Deployed on AWS EC2 — public URL: **[fill in after deployment]**
- Manual deployment process (no CI/CD) — documented in [deployment section / link, to be added]

## Known limitations
- New users always register as `EndUser` by default; promoting a user to `Agent` currently requires manually updating the `role` field in the database (no admin UI yet)
- [Add any other real limitations you're aware of]

## Links
- Jira: **[your link]**
- Figma: **[your link]**
- Draw.io: **[your link]**
- GitHub: https://github.com/172003/IT-Support-Ticket-System

* **Nodejs [**[https://nodejs.org/en](https://nodejs.org/en)]** **
* **Git [**[https://git-scm.com/](https://git-scm.com/)]** **
* **VS code editor** [[https://code.visualstudio.com/](https://code.visualstudio.com/)]** **
* **MongoDB Account** [[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)]** - In tutorial, we have also showed how can you create account and database: follow step number 2.**
* **GitHub Account** [[https://github.com/signup?source=login](https://github.com/signup?source=login)]** **

---
