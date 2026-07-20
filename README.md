_"This project has been created as part of the 42 curriculum by chaikney, gcassi-d, mdiaz-or and nkrasimi."_

## 1. Project Overview

A **Single Page Application (SPA)** built with **React** and **Ruby on Rails**, featuring real-time multiplayer gaming via **WebSockets (ActionCable)**, secure **OAuth 2.0 (42)** authentication, and a robust **ELO-based ranking system**.

That is the show off language. What is it _really_? It's a website where you can play a 2-player game of chess, or a single player game of sudoku. Login is easy for those with 42 accounts and available for anyone with an email address. You can make friends, chat and compare rankings on a global leaderboard.

On the horizon, the **goal** of the project was for us all to gain experience in working on a complex project, in a team, and demonstrate our ability to work with the kind of tools you. In each of our roles we aimed to have gone beyond the minimum demanded by the subject criteria.

**Note for evaluators** Please do first jump to Section 5 on launching the project. Containers from scratch take a while to build and launch. Later, you may also enjoy the convenience function `make review_envs` to inspect the running containers.

## 2. Key Features

- **Real-time Gaming:** Multiplayer engine with low-latency synchronization.
- **Authentication:** Secure OAuth 2.0 integration with 42 Intra or local account registration.
- **Security:** Advanced RBAC (Role-Based Access Control) for Admin/Player roles and 2FA via TOTP.
- **Social & Competitive:** Global leaderboard, detailed match history, chat, and friend systems.
- **Spectator Mode:** Live match broadcasting with real-time viewer counting.

## 3. Tech Stack & Justifications

- **Frontend:** React, TypeScript, Tailwind CSS, Zustand (Global State).
- **Backend:** Ruby on Rails (API Mode), PostgreSQL.
- **Real-time:** ActionCable (WebSockets), Redis.
- **Infrastructure:** Docker & Docker Compose, Nginx. A [full discussion of the infrastructural choices can be found here](./docs/containers.rst).

**Why this stack?**
* **React & TypeScript:** Provides a predictable, strictly-typed component architecture essential for managing the complex, rapidly changing state of the Sudoku and Chess game logic and real-time UI synchronization.
* **Ruby on Rails (API Mode):** Chosen for its rapid development capabilities and robust ActiveRecord ORM, allowing us to build secure endpoints and complex database queries for the matchmaking and ELO systems quickly.
* **PostgreSQL:** Essential for relational data integrity, specifically handling concurrent user match history, matchmaking queues, and secure storage of OAuth profiles without locking issues.
* **Zustand:** Selected over Redux for a lighter, boilerplate-free global state management, critical for maintaining the `ConnectionStatus` and WebSocket payloads without unnecessary re-renders.

## 4. Team Members & Individual Contributions

* **mdiaz-or (Project Manager)**
  *  Led project planning, scheduling, tracking, and technical documentation, ensuring an agile and structured workflow.
  - Architected and orchestrated the frontend using a fully decoupled SPA model, implementing critical features including global chat, spectator mode, and real-time notifications.
  - Optimized performance through global state management with **Zustand** and a strict separation of concerns between presentation and business logic, ensuring a highly testable, scalable, and maintainable system.

* **nkrasimi (Technical Lead / Backend & Fullstack)**
  * Designed and implemented the PostgreSQL database schema and ActiveRecord relationships.
  * Engineered the Sudoku gameplay mechanics, real-time board state validation, and responsive UI logic.
  * Built the backend user matchmaking system and the ELO calculation engine.
  * Integrated secure OAuth 2.0 authentication with the 42 Network API.

* **gcassi-d (Software Developer)**
  * Implemented the chess motor in c++, then translated it to ruby.
  * Implemented the chess UI, as well as piece moving and game-ending flow.
  * General UI fixes for phone visualization.
  * General bug fixes for friends, admin control and login features.

* **chaikney (DevOps, Release Manager)**
  * Implementation and orchestration of production containers.
  * Deployment tooling. Makefile with checks, convenience functions.
  * Secure environment handling. Managing secrets with the compose file and ensuring they are not visible in container environments.
  * Continuous testing of builds.
  * Liaison with 42 staff, demonstrate project progress.
  * Manage git branching and merges.
  * Patching backend and frontend code to ensure the project works outwith the developers' machines.

## 5. Getting Started

The simplest possible setup is the following.
```bash
# Clone the repository from vog
git clone git@vogsphere.42urduliz.com:vogsphere/intra-uuid-d9bb6f6a-1246-45bc-9a4a-cac51a66ad36-7514648-gcassi-d
# or from GitHub:
git clone https://github.com/Chaikney/ft_transcendence.git

cd ft_transcendence

# Set up environment variables
# NOTE you may want to provide your own value of UID_42, see the notes below.
cp .env.example .env

# Set up 42 API Secret for OAuth and the SMTP password for to send confirmation emails
mkdir -p secret
nano secret/42API_SEC # Paste your 42 API Secret inside and save
nano secret/SMTP_PASS # Paste your SMTP password inside and save

# Build and start services using the Makefile. This can generate local SSL certs, DB password etc.
# Checks for the presence of necessary secrets and uses Docker by default.
make
# find out what else the Makefile can do with
make help
```

Once you have launched the cluster with `make`, you can monitor its progress in that terminal, and check on its status in another terminal with `docker ps` or your tools of choice.

### Notes on secrets
Some secret values are generated on first launch. Some must be provided by the user or evaluator. Every effort has been made to explain the difference and avoid surprises or confusion, but oh look a green monkey in the middle of my sentence nobody reads documentation any more, if they ever did.

Generated by `make` targets:
- HTTPS certificates: this leads to a security warning for self-certified certificates. This is not a real security problem.
- the database password: generated if not already present at ./secrets/rb_dbpass - this has 2 important implications. First, if you are trying to access an existing DB, make sure the file is present and correct before launch. Second, if you want to get rid of an old DB and start again you must delete the old file to avoid password reuse.

The SMTP_PASS will be provided by the team on evaluation, or provide all your own SMTP details.

### Notes on 42 API keys in particular
These are in 2 parts; think of them roughly as being a user id (that starts with u-) and its password (starts with s-). The u- part is **not secret**, no matter how hacker-y it looks in logfiles. We provide one of these in `.env.example`, it identifies the app to 42 infra. The s- part **is** secret, expires periodically, and must be provided by the team or the evaluator.

There are 3 parts that have to work together: UID_42, 42API_SEC, and the redirect URLs in the env (REDIRECT_URI_42) and registered at 42. Ensure they all match or you will have a bad time.

## 6. Architecture & Design

- **Pub/Sub Pattern:** Explain how you use WebSockets for real-time game updates and spectator broadcasting.
- **Security:** Highlight the backend-first validation approach (RBAC and TOTP verification).

### Container orchestration
There are more details than you need in [containers.rst](./docs/containers.rst)

### Database Schema
The backend uses PostgreSQL, we see it as the default choice for many applications and it is well-supported by the standard ruby tools and in containers. It works at our small scale and would be scalable if this platform were to go excitingly viral. The detailed schema of the database can be consulted in [a separate document](./docs/DB_details.md). The core schema consists of the following primary relations:

* users
: can be defined locally or through registration by 42 OAUTH
* games
: Store the chess games started and their existing state.
* sudoku_games
: Stores the sudoku games started and their existing state.
* blocks
: manages social relationships between players
* friendships
: Also manages social relationships between players, this is the nice side of it.
* rooms
: defines the chat rooms
* room_memberships
: defines membership of the chat rooms
* messages
: Chat functionality

## 7. TODO Modules & Points Claimed
We are claiming a total of 21 points.

### **Web (8 puntos)**

- ✅ **Major (2 pts): Frameworks frontend + backend**

    - Frontend: React 18.3.1 + TypeScript + Vite (mdiaz-or)

    - Backend: Ruby on Rails 8.1.3 (nkrasimi)

- ✅ **Major (2 pts): Real-time features con WebSockets**

    - Action Cable implemented (nkrasimi)

    - Real-timeChat (mdiaz-or)

    - Real time gameplay (chess, sudoku) (nkrasimi, gcassi-d)

    - Handle (dis)connection gracefully (mdiaz-or)

    - Efficient broadcasting (mdiaz-or)

- ✅ **Major (2 pts): User interaction**

    - Basic Chat (send/receive messages) (mdiaz-or)

    - Profile system (nkrasimi, gcassi-d)

    - Online "friends" system (add/remove, ready) (nkrasimi, gcassi-d)

- ✅ **Minor (1 pt): ORM**

    - ActiveRecord (Ruby on Rails ORM) (nkrasimi)

- ✅ **Minor (1 pt): Custom design system**

    - 15+ reusable components implemented including: Button, Modal, Avatar, Badge, Toast, Navbar, Footer, TerminalCard, LoadingScreen, AuthScreen, Login, ErrorMessage, ConnectionStatus, LobbyScreen, MatchmakingModal, ProtectedRoute
        (mdiaz-or)

### **User Management (7 puntos)**

- ✅ **Major (2 pts): Standard user management**

    - Users can update their profile (nkrasimi, gcassi-d)

    - Avatar images with defaults (nkrasimi, gcassi-d)

    - Friends system with online status (nkrasimi, gcassi-d)

    - Profile page (nkrasimi, gcassi-d)

- ✅ **Minor (1 pt): Game statistics**

    - Elo system implemented (gcassi-d)

    - Leaderboard (mdiaz-or)

    - Match history (mdiaz-or)

- ✅ **Minor (1 pt): OAuth 2.0**

    - OAuth implemented using 42 accounts (nkrasimi)

- ✅ **Major (2 pts): Advanced permissions**

    - CRUD operations on users can be done by admins (nkrasimi)

    - Define Roles (player/admin) (nkrasimi)

    - Roles have different views (nkrasimi)

- ✅ **Minor (1 pt): 2FA completo**

    - 2FA with ROTP implemented (nkrasimi, gcassi-d)

    - email code provisioning (nkrasimi, gcassi-d)


### **Gaming and UX (7 puntos)**

- ✅ **Major (2 pts): Web-based game**

    - Chess implemented in ruby (gcassi-d)

    - Live matches are watchable (nkrasimi)

    - Clear rules (it is chess as someone from 250 years ago would recognise) (gcassi-d)

    - Clear victory / defeat conditions (as above) (gcassi-d)

    - Matchmaking (nkrasimi)

- ✅ **Major (2 pts): Remote players**

    - Two player can play on seaprate computers (mdiaz-or)

    - Latency is handled (mdiaz-or)

    - Reconnection logic (mdiaz-or)

- ✅ **Major (2 pts): Add another game**

    - Sudoku implemented as 2nd game (nkrasimi, mdiaz-or)

    - User history (nkrasimi, gcassi-d)

-  **✅Minor (1 pt): Spectator mode**

    - SpectatorPage implemented (mdiaz-or)

    - Real-time updates (mdiaz-or)

    - Spectator count (mdiaz-or)
