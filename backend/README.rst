---------------
Chess Project
---------------

What we have
------------

* A chess engine (parser) in C++
  Emits JSON?
* (TBC) an AI that interfaces with it to play / supply moves
* thoughts of using Ruby as the frontend

What we need
------------

* Work plan
* Division of roles
* Agreement on structure / architecture
  - How do the frontend, backend, engine fit together? Assume (for now) we need a container for each
* Comms / planning tools beyond WhatsApp group?
* Interface between chess engine and other parts / frontend

Members
-------

 - Chris
 - Nikola
 - Garikoitz
 - Manu
 - Borja (tbc?)

Agreement
---------

Aiming for completion before the summer.

Modules that we can pass
------------------------

* AI opponent for games (major)
* One Game (major)
  Implement a complete web-based game where users can play against each other.
* Second game (sudoku with timers) (major)
  add another game with user history and matchmaking.
  Track user history and statistics for this game.
  Implement a matchmaking system.
  Maintain performance and responsiveness
  This unlocks multiplayer (use timers)
* remote players (major)
* 3d graphics (major)
  Implement advanced 3D graphics using a library like Three.js or Babylon.js
  I have doubts about this.
* Spectator (minor)
  Allow users to watch ongoing games.
  Real-time updates for spectators.
  Optional: spectator chat.
* Gamification (minor)
  gamification system to reward users for their actions.
  Implement at least 3 of the following: achievements, badges, leaderboards, XP/level system, daily challenges, rewards
  System must be persistent (stored in database)
  Visual feedback for users (notifications, progress bars, etc.)
  Clear rules and progression mechanic

Implicit in this are:
* frontend & * backend framework -- but do we really have both of these??

This reaches 14, but only just. Some more would be wise.

Tasks to explore in advance
---------------------------

Things that might be useful. things that we can use in the project *regardless* of the final architecture.

Containers
..........

Containers for:
- web server
- running the chess engine
- running the sudoku engine - how is this to be done?
- database
- running Stockfish (this can be done in Alpine Linux, I checked. How to communicate with it is another question though...)
  NB Stockfish would be analogous to the AI opponent - if we make them the same interface (UCI standard) then they could be swapped out (relatively) simply.

Do we need an agreed base for containers? Or can we mix and match debian, Alpine etc depending on which works? Perhaps a shared base that could be used in a Dockerfile FROM statement or similar.

Database
.........

A **database schema** for the project.
- users
- statistics
- full games of chess?
- persistent chat history

This should work for SQLite, PostgreSQL. Also keep in mind the need to be modular - if we swap out a thing, or it is not up to scratch it should be easy to remove it and not damage the other parts of the app.
