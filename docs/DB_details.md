# Transcendence Project Database Schema

This was generated using `psql` commands and is for reference. An overview discussion of the database can be found in the main README.md file.

## List of relations

Some of these are not very interesting, e.g. ar_internal_metadata and schema_migrations (used by the ruby ORM).

 Schema |         Name         | Type  |  Owner   
--------+----------------------+-------+----------
 public | ar_internal_metadata | table | postgres
 public | blocks               | table | postgres
 public | friendships          | table | postgres
 public | games                | table | postgres
 public | messages             | table | postgres
 public | room_memberships     | table | postgres
 public | rooms                | table | postgres
 public | schema_migrations    | table | postgres
 public | sudoku_games         | table | postgres
 public | users                | table | postgres
(10 rows)


## Details of each table

### Table "public.games"

     Column      |              Type              | Collation | Nullable |              Default              | Storage  | Compression | Stats target | Description 
-----------------+--------------------------------+-----------+----------+-----------------------------------+----------+-------------+--------------+-------------
 id              | bigint                         |           | not null | nextval('games_id_seq'::regclass) | plain    |             |              | 
 created_at      | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
 current_board   | character varying              |           |          |                                   | extended |             |              | 
 fen_history     | json                           |           |          |                                   | extended |             |              | 
 initial_board   | character varying              |           |          |                                   | extended |             |              | 
 p1_score        | integer                        |           |          | 0                                 | plain    |             |              | 
 p2_score        | integer                        |           |          | 0                                 | plain    |             |              | 
 player1_id      | integer                        |           |          |                                   | plain    |             |              | 
 player2_id      | integer                        |           |          |                                   | plain    |             |              | 
 status          | character varying              |           |          |                                   | extended |             |              | 
 updated_at      | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
 winner_id       | integer                        |           |          |                                   | plain    |             |              | 
 current_turn_id | integer                        |           |          |                                   | plain    |             |              | 
Indexes:
    "games_pkey" PRIMARY KEY, btree (id)
    "index_games_on_status" btree (status)
Foreign-key constraints:
    "fk_rails_2175de0ab8" FOREIGN KEY (player2_id) REFERENCES users(id)
    "fk_rails_c341d2ac1e" FOREIGN KEY (player1_id) REFERENCES users(id)
Access method: heap

### Table "public.rooms"
   Column   |              Type              | Collation | Nullable |              Default              | Storage  | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+-----------------------------------+----------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('rooms_id_seq'::regclass) | plain    |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
 name       | character varying              |           |          |                                   | extended |             |              | 
 type       | character varying              |           |          |                                   | extended |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
Indexes:
    "rooms_pkey" PRIMARY KEY, btree (id)
Referenced by:
    TABLE "room_memberships" CONSTRAINT "fk_rails_98b996f58e" FOREIGN KEY (room_id) REFERENCES rooms(id)
    TABLE "messages" CONSTRAINT "fk_rails_a8db0fb63a" FOREIGN KEY (room_id) REFERENCES rooms(id)
Access method: heap

### Table "public.room_memberships"
   Column   |              Type              | Collation | Nullable |                   Default                    | Storage | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+----------------------------------------------+---------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('room_memberships_id_seq'::regclass) | plain   |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                              | plain   |             |              | 
 room_id    | bigint                         |           | not null |                                              | plain   |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                              | plain   |             |              | 
 user_id    | bigint                         |           | not null |                                              | plain   |             |              | 
Indexes:
    "room_memberships_pkey" PRIMARY KEY, btree (id)
    "index_room_memberships_on_room_id" btree (room_id)
    "index_room_memberships_on_user_id" btree (user_id)
Foreign-key constraints:
    "fk_rails_98b996f58e" FOREIGN KEY (room_id) REFERENCES rooms(id)
    "fk_rails_9e247fff77" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap

### Table "public.sudoku_games"
   Column   |              Type              | Collation | Nullable |                 Default                  | Storage  | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+------------------------------------------+----------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('sudoku_games_id_seq'::regclass) | plain    |             |              | 
 board      | text                           |           |          |                                          | extended |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                          | plain    |             |              | 
 difficulty | character varying              |           |          |                                          | extended |             |              | 
 status     | character varying              |           |          |                                          | extended |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                          | plain    |             |              | 
 user_id    | bigint                         |           | not null |                                          | plain    |             |              | 
Indexes:
    "sudoku_games_pkey" PRIMARY KEY, btree (id)
    "index_sudoku_games_on_user_id" btree (user_id)
Foreign-key constraints:
    "fk_rails_7ee1dadd8d" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap

### Table "public.messages"
   Column   |              Type              | Collation | Nullable |               Default                | Storage  | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+--------------------------------------+----------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('messages_id_seq'::regclass) | plain    |             |              | 
 content    | text                           |           |          |                                      | extended |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                      | plain    |             |              | 
 read       | boolean                        |           |          |                                      | plain    |             |              | 
 room_id    | bigint                         |           | not null |                                      | plain    |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                      | plain    |             |              | 
 user_id    | bigint                         |           | not null |                                      | plain    |             |              | 
Indexes:
    "messages_pkey" PRIMARY KEY, btree (id)
    "index_messages_on_room_id" btree (room_id)
    "index_messages_on_user_id" btree (user_id)
Foreign-key constraints:
    "fk_rails_273a25a7a6" FOREIGN KEY (user_id) REFERENCES users(id)
    "fk_rails_a8db0fb63a" FOREIGN KEY (room_id) REFERENCES rooms(id)
Access method: heap

### Table "public.users"
         Column         |              Type              | Collation | Nullable |              Default              | Storage  | Compression | Stats target | Description 
------------------------+--------------------------------+-----------+----------+-----------------------------------+----------+-------------+--------------+-------------
 id                     | bigint                         |           | not null | nextval('users_id_seq'::regclass) | plain    |             |              | 
 avatar_url             | character varying              |           |          |                                   | extended |             |              | 
 banned                 | boolean                        |           |          |                                   | plain    |             |              | 
 created_at             | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
 elo                    | integer                        |           |          | 0                                 | plain    |             |              | 
 email                  | character varying              |           |          |                                   | extended |             |              | 
 losses                 | integer                        |           |          | 0                                 | plain    |             |              | 
 mfa_enabled            | boolean                        |           |          |                                   | plain    |             |              | 
 otp_secret             | character varying              |           |          |                                   | extended |             |              | 
 password_digest        | character varying              |           |          |                                   | extended |             |              | 
 role                   | integer                        |           |          |                                   | plain    |             |              | 
 status                 | character varying              |           |          | 'offline'::character varying      | extended |             |              | 
 uid42                  | integer                        |           |          |                                   | plain    |             |              | 
 updated_at             | timestamp(6) without time zone |           | not null |                                   | plain    |             |              | 
 username               | character varying              |           |          |                                   | extended |             |              | 
 wins                   | integer                        |           |          | 0                                 | plain    |             |              | 
 confirmation_token     | character varying              |           |          |                                   | extended |             |              | 
 confirmed_at           | timestamp(6) without time zone |           |          |                                   | plain    |             |              | 
 reset_password_token   | character varying              |           |          |                                   | extended |             |              | 
 reset_password_sent_at | timestamp(6) without time zone |           |          |                                   | plain    |             |              | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
Referenced by:
    TABLE "games" CONSTRAINT "fk_rails_2175de0ab8" FOREIGN KEY (player2_id) REFERENCES users(id)
    TABLE "messages" CONSTRAINT "fk_rails_273a25a7a6" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "sudoku_games" CONSTRAINT "fk_rails_7ee1dadd8d" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "room_memberships" CONSTRAINT "fk_rails_9e247fff77" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "games" CONSTRAINT "fk_rails_c341d2ac1e" FOREIGN KEY (player1_id) REFERENCES users(id)
    TABLE "friendships" CONSTRAINT "fk_rails_d78dc9c7fd" FOREIGN KEY (friend_id) REFERENCES users(id)
    TABLE "friendships" CONSTRAINT "fk_rails_e3733b59b7" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap

### Table "public.friendships"
   Column   |              Type              | Collation | Nullable |                 Default                 | Storage  | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+-----------------------------------------+----------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('friendships_id_seq'::regclass) | plain    |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                         | plain    |             |              | 
 friend_id  | bigint                         |           | not null |                                         | plain    |             |              | 
 status     | character varying              |           |          | 'pending'::character varying            | extended |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                         | plain    |             |              | 
 user_id    | bigint                         |           | not null |                                         | plain    |             |              | 
Indexes:
    "friendships_pkey" PRIMARY KEY, btree (id)
    "index_friendships_on_friend_id" btree (friend_id)
    "index_friendships_on_user_id" btree (user_id)
    "index_friendships_on_user_id_and_friend_id" UNIQUE, btree (user_id, friend_id)
Foreign-key constraints:
    "fk_rails_d78dc9c7fd" FOREIGN KEY (friend_id) REFERENCES users(id)
    "fk_rails_e3733b59b7" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap

### Table "public.schema_migrations"
 Column  |       Type        | Collation | Nullable | Default | Storage  | Compression | Stats target | Description 
---------+-------------------+-----------+----------+---------+----------+-------------+--------------+-------------
 version | character varying |           | not null |         | extended |             |              | 
Indexes:
    "schema_migrations_pkey" PRIMARY KEY, btree (version)
Access method: heap

### Table "public.ar_internal_metadata"
   Column   |              Type              | Collation | Nullable | Default | Storage  | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+---------+----------+-------------+--------------+-------------
 key        | character varying              |           | not null |         | extended |             |              | 
 value      | character varying              |           |          |         | extended |             |              | 
 created_at | timestamp(6) without time zone |           | not null |         | plain    |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |         | plain    |             |              | 
Indexes:
    "ar_internal_metadata_pkey" PRIMARY KEY, btree (key)
Access method: heap

### Table "public.blocks"
   Column   |              Type              | Collation | Nullable |              Default               | Storage | Compression | Stats target | Description 
------------+--------------------------------+-----------+----------+------------------------------------+---------+-------------+--------------+-------------
 id         | bigint                         |           | not null | nextval('blocks_id_seq'::regclass) | plain   |             |              | 
 blocker_id | integer                        |           |          |                                    | plain   |             |              | 
 blocked_id | integer                        |           |          |                                    | plain   |             |              | 
 created_at | timestamp(6) without time zone |           | not null |                                    | plain   |             |              | 
 updated_at | timestamp(6) without time zone |           | not null |                                    | plain   |             |              | 
Indexes:
    "blocks_pkey" PRIMARY KEY, btree (id)
    "index_blocks_on_blocked_id" btree (blocked_id)
    "index_blocks_on_blocker_id" btree (blocker_id)
    "index_blocks_on_blocker_id_and_blocked_id" UNIQUE, btree (blocker_id, blocked_id)
Access method: heap

