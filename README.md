# ft_transcendence

> "The final project of the common core: A real-time competitive gaming platform."

## 1. Project Overview

A **Single Page Application (SPA)** built with **React** and **Ruby on Rails**, featuring real-time multiplayer gaming via **WebSockets (ActionCable)**, secure **OAuth 2.0 (42)** authentication, and a robust **ELO-based ranking system**.

**Note for evaluators** you may want to jump to Section 5 on launching the project. You may also enjoy the convenience function `make review_envs` to inspect the running containers.

## 2. Key Features

- **Real-time Gaming:** Multiplayer engine with low-latency synchronization.
- **Authentication:** Secure OAuth 2.0 integration with 42 Intra or local acccount registration.
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
  * _[Añadir descripciones específicas de sus aportaciones reales]_
  * Planning, scheduling, project tracking, and documentation.

* **nkrasimi (Technical Lead / Backend & Fullstack)**
  * Designed and implemented the PostgreSQL database schema and ActiveRecord relationships.
  * Engineered the Sudoku gameplay mechanics, real-time board state validation, and responsive UI logic.
  * Built the backend user matchmaking system and the ELO calculation engine.
  * Integrated secure OAuth 2.0 authentication with the 42 Network API.

* **gcassi-d (Software Developer)**
  * _[Añadir descripciones específicas de sus aportaciones reales]_
  * Implementation of features, debugging, and testing.

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
cp .env.example .env

# Set up 42 API Secret for OAuth
mkdir -p secret
nano secret/42API_SEC # Paste your 42 API Secret inside and save

# Build and start services using the Makefile (generates local SSL certs and uses Docker)
make
```

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
_[Lista pendiente de rellenar con los Major y Minor modules de la hoja de corrección para la evaluación]_
