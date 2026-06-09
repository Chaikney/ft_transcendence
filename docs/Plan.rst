------------------------------
ft_transcendence project plan
------------------------------

Team: members and commitment
----------------------------

Members
.......

- Chris Haikney / chaikney
- Nikola / nkrasimi
- Garikoitz / gcassi-d
- Manu / TODO: add login name here
- Borja / bde-mada

Agreement
.........

Aiming for completion "before the summer."

Roles
.....

Each member has a general area of responsibility, agreed in conversation in May 2026. Those roles are sketched in documents also included in this folder, refer to those for details.

- chaikney -- DevOps
- nkrasimi -- backend dev
- Manu -- frontend dev
- Garikoitz -- chess engine
- Borja -- AI chess partner

In addition to the general responsibilities, all will take on extra tasks as needed and according to their ability.

Expected level of activity
...........................

Each has different schedule and availability to overcome the challenges here requires **regular and clear communication** with colleagues. There is a group on Slack (to coordinate development) and on WhatsApp (for more urgent requests).

The evaluation requires us to demonstrate the contribution of each team member. The simplest way of doing this is for us *all*  to commit code to the same repository.  This also shows to potential employers our ability to use git.

The shared repo: https://github.com/Chaikney/ft_transcendence

All team members are to be invited to commit but this requires they provide an account and accept the invitation.

We will build
-------------

A platform that allows games to be played. The specific games considered are *sudoku* and *chess*.

Project against subject criteria
................................

The scoring and similar monitoring against the target points needed is detailed in a spreadsheet (https://my.owndrive.com/s/NHsFqSAC7ZNRG7E) but will include the following.

Major criteria (2 points)
_________________________

* AI opponent for games
* One Game
    Implement a complete web-based game where users can play against each other.
* Second game (sudoku with timers)
    add another game with user history and matchmaking.
    Track user history and statistics for this game.
    Implement a matchmaking system.
    Maintain performance and responsiveness
    This unlocks multiplayer (use timers)
* remote players
* 3d graphics
    Implement advanced 3D graphics using a library like Three.js or Babylon.js

Implicit in this are:

* use of a frontend & backend framework.

Minor criteria (1 point)
_________________________
* Spectator
    Allow users to watch ongoing games.
    Real-time updates for spectators.
    Optional: spectator chat.
* Gamification
    gamification system to reward users for their actions.
    Implement at least 3 of the following: achievements, badges, leaderboards, XP/level system, daily challenges, rewards
    System must be persistent (stored in database)
    Visual feedback for users (notifications, progress bars, etc.)
    Clear rules and progression mechanic


Milestones
----------

Refer to the spreadsheet: https://my.owndrive.com/s/NHsFqSAC7ZNRG7E

Project Risks
-------------

There are some factors that could lead to delay against anticipated time.

- Mix of technologies
    The languages that are used for the different project parts are not homogeneous or necessarily the easiest to mix together. They include C++, TypeScript (JavaScript), and Ruby. It is anticipated that the use of containers and orchestration will be able to see them functioning well together, however the fact remains that their build systems and general approaches may have mismatches that introduce delays.
- Loss of team member
    Each member of the team has different availability, hours and commitments. This represents a challenge that we expect to mitigate with communication both verbal and documentation. It may prove impossible for the current team of 5 to complete the project together, but the loss of a single member would not invalidate the membership rule.
- Lack of features
    Relating to the above, the loss of a team member would necessitate replacing the points that they were responsible for delivering, either by choosing a different approach or by another member delivering the requirement.
- Inadequate testing
    The mixed environment and tight time schedule make it important to have a clearly defined testing plan that any member can pick up and examine. This could work well if managed correctly.
- Evaluation environment
    The evaluation will start badly if the evaluator has to start with complicated workarounds to bring up the system on the cluster computers. To mitigate that, a VM should be available with the software and configuration required to act as a sufficient host (e.g. podman). This should be accompanied by clear instructions for use and a demonstration that there are no tricks hidden (e.g. that the cache is clear).
- Lack of cross-team understanding
    All team members must be able to explain and show their part in the project. They don't need to explain the details of others' roles but the *must* know what those roles are and how they interface with the other parts of the project. They must also be able to explain their role in depth and answer questions about it. If the evaluator requires changes they must be able to demonstrate how those would be made. Design trade-offs should be known and explicable.

Current challenges requiring extra time
---------------------------------------

- Borja has been away for work  up to this point (2026-06-08) and the integration work has not been able to begin.
- chaikney is a numpty who booked the wrong number of days in his (final) freeze period. Has black hole date of 2026-06-15 despite only having used 73 days of freeze.
- Manu works in Navarra during the early part of the week and can be present in the tower Thursday-Saturdays.
- garikoitz had exams until last Thursday (2026-06-04) but is now fully available.
- nkrasimi has general availability from Wednesdays to the weekend.

The intention of all in the team is to complete the project before the start of summer. The most likely target dates are the completed project by the 23rd June, leaving the week that follows for evaluations.

Note on AI use
--------------

Documented written  by chaikney without the use of AI, but the version in Spanish was machine translated because he had his B2.2 exam just last week and quite fancied a break.
