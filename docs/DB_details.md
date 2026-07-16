# Transcendence Project Database Schema

This was generated using `psql` commands and is for reference. An overview discussion of the database can be found in the main README.md file.

## List of relations

Some of these are not very interesting, e.g. ar_internal_metadata and schema_migrations (used by the ruby ORM).

| Schema | Name | Type | Owner |
|--------|------|------|-------|
| public | ar_internal_metadata | table | postgres |
| public | blocks | table | postgres |
| public | friendships | table | postgres |
| public | games | table | postgres |
| public | messages | table | postgres |
| public | room_memberships | table | postgres |
| public | rooms | table | postgres |
| public | schema_migrations | table | postgres |
| public | sudoku_games | table | postgres |
| public | users | table | postgres |

## Details of each table

### Table "public.games"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('games_id_seq'::regclass) |
| created_at | timestamp(6) without time zone | not null | |
| current_board | character varying | | |
| fen_history | json | | |
| initial_board | character varying | | |
| p1_score | integer | | 0 |
| p2_score | integer | | 0 |
| player1_id | integer | | |
| player2_id | integer | | |
| status | character varying | | |
| updated_at | timestamp(6) without time zone | not null | |
| winner_id | integer | | |
| current_turn_id | integer | | |

**Indexes:**
- `games_pkey` PRIMARY KEY, btree (id)
- `index_games_on_status` btree (status)

**Foreign-key constraints:**
- `fk_rails_2175de0ab8` FOREIGN KEY (player2_id) REFERENCES users(id)
- `fk_rails_c341d2ac1e` FOREIGN KEY (player1_id) REFERENCES users(id)

---

### Table "public.rooms"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('rooms_id_seq'::regclass) |
| created_at | timestamp(6) without time zone | not null | |
| name | character varying | | |
| type | character varying | | |
| updated_at | timestamp(6) without time zone | not null | |

**Indexes:**
- `rooms_pkey` PRIMARY KEY, btree (id)

**Referenced by:**
- TABLE "room_memberships" CONSTRAINT "fk_rails_98b996f58e" FOREIGN KEY (room_id) REFERENCES rooms(id)
- TABLE "messages" CONSTRAINT "fk_rails_a8db0fb63a" FOREIGN KEY (room_id) REFERENCES rooms(id)

---

### Table "public.room_memberships"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('room_memberships_id_seq'::regclass) |
| created_at | timestamp(6) without time zone | not null | |
| room_id | bigint | not null | |
| updated_at | timestamp(6) without time zone | not null | |
| user_id | bigint | not null | |

**Indexes:**
- `room_memberships_pkey` PRIMARY KEY, btree (id)
- `index_room_memberships_on_room_id` btree (room_id)
- `index_room_memberships_on_user_id` btree (user_id)

**Foreign-key constraints:**
- `fk_rails_98b996f58e` FOREIGN KEY (room_id) REFERENCES rooms(id)
- `fk_rails_9e247fff77` FOREIGN KEY (user_id) REFERENCES users(id)

---

### Table "public.sudoku_games"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('sudoku_games_id_seq'::regclass) |
| board | text | | |
| created_at | timestamp(6) without time zone | not null | |
| difficulty | character varying | | |
| status | character varying | | |
| updated_at | timestamp(6) without time zone | not null | |
| user_id | bigint | not null | |

**Indexes:**
- `sudoku_games_pkey` PRIMARY KEY, btree (id)
- `index_sudoku_games_on_user_id` btree (user_id)

**Foreign-key constraints:**
- `fk_rails_7ee1dadd8d` FOREIGN KEY (user_id) REFERENCES users(id)

---

### Table "public.messages"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('messages_id_seq'::regclass) |
| content | text | | |
| created_at | timestamp(6) without time zone | not null | |
| read | boolean | | |
| room_id | bigint | not null | |
| updated_at | timestamp(6) without time zone | not null | |
| user_id | bigint | not null | |

**Indexes:**
- `messages_pkey` PRIMARY KEY, btree (id)
- `index_messages_on_room_id` btree (room_id)
- `index_messages_on_user_id` btree (user_id)

**Foreign-key constraints:**
- `fk_rails_273a25a7a6` FOREIGN KEY (user_id) REFERENCES users(id)
- `fk_rails_a8db0fb63a` FOREIGN KEY (room_id) REFERENCES rooms(id)

---

### Table "public.users"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('users_id_seq'::regclass) |
| avatar_url | character varying | | |
| banned | boolean | | |
| created_at | timestamp(6) without time zone | not null | |
| elo | integer | | 0 |
| email | character varying | | |
| losses | integer | | 0 |
| mfa_enabled | boolean | | |
| otp_secret | character varying | | |
| password_digest | character varying | | |
| role | integer | | |
| status | character varying | | 'offline'::character varying |
| uid42 | integer | | |
| updated_at | timestamp(6) without time zone | not null | |
| username | character varying | | |
| wins | integer | | 0 |
| confirmation_token | character varying | | |
| confirmed_at | timestamp(6) without time zone | | |
| reset_password_token | character varying | | |
| reset_password_sent_at | timestamp(6) without time zone | | |

**Indexes:**
- `users_pkey` PRIMARY KEY, btree (id)

**Referenced by:**
- TABLE "games" CONSTRAINT "fk_rails_2175de0ab8" FOREIGN KEY (player2_id) REFERENCES users(id)
- TABLE "messages" CONSTRAINT "fk_rails_273a25a7a6" FOREIGN KEY (user_id) REFERENCES users(id)
- TABLE "sudoku_games" CONSTRAINT "fk_rails_7ee1dadd8d" FOREIGN KEY (user_id) REFERENCES users(id)
- TABLE "room_memberships" CONSTRAINT "fk_rails_9e247fff77" FOREIGN KEY (user_id) REFERENCES users(id)
- TABLE "games" CONSTRAINT "fk_rails_c341d2ac1e" FOREIGN KEY (player1_id) REFERENCES users(id)
- TABLE "friendships" CONSTRAINT "fk_rails_d78dc9c7fd" FOREIGN KEY (friend_id) REFERENCES users(id)
- TABLE "friendships" CONSTRAINT "fk_rails_e3733b59b7" FOREIGN KEY (user_id) REFERENCES users(id)

---

### Table "public.friendships"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('friendships_id_seq'::regclass) |
| created_at | timestamp(6) without time zone | not null | |
| friend_id | bigint | not null | |
| status | character varying | | 'pending'::character varying |
| updated_at | timestamp(6) without time zone | not null | |
| user_id | bigint | not null | |

**Indexes:**
- `friendships_pkey` PRIMARY KEY, btree (id)
- `index_friendships_on_friend_id` btree (friend_id)
- `index_friendships_on_user_id` btree (user_id)
- `index_friendships_on_user_id_and_friend_id` UNIQUE, btree (user_id, friend_id)

**Foreign-key constraints:**
- `fk_rails_d78dc9c7fd` FOREIGN KEY (friend_id) REFERENCES users(id)
- `fk_rails_e3733b59b7` FOREIGN KEY (user_id) REFERENCES users(id)

---

### Table "public.schema_migrations"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| version | character varying | not null | |

**Indexes:**
- `schema_migrations_pkey` PRIMARY KEY, btree (version)

---

### Table "public.ar_internal_metadata"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| key | character varying | not null | |
| value | character varying | | |
| created_at | timestamp(6) without time zone | not null | |
| updated_at | timestamp(6) without time zone | not null | |

**Indexes:**
- `ar_internal_metadata_pkey` PRIMARY KEY, btree (key)

---

### Table "public.blocks"

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | bigint | not null | nextval('blocks_id_seq'::regclass) |
| blocker_id | integer | | |
| blocked_id | integer | | |
| created_at | timestamp(6) without time zone | not null | |
| updated_at | timestamp(6) without time zone | not null | |

**Indexes:**
- `blocks_pkey` PRIMARY KEY, btree (id)
- `index_blocks_on_blocked_id` btree (blocked_id)
- `index_blocks_on_blocker_id` btree (blocker_id)
- `index_blocks_on_blocker_id_and_blocked_id` UNIQUE, btree (blocker_id, blocked_id)
