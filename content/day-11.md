---
reading_time: 16 min
tags: ["data", "sql", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Design and query a campus clubs schema in SQLite", "url": "https://example.com/labs/day-11"}
resources: [{"title": "SQLite docs", "url": "https://sqlite.org/"}, {"title": "PostgreSQL docs", "url": "https://www.postgresql.org/docs/"}, {"title": "SQLite CLI reference", "url": "https://sqlite.org/cli.html"}, {"title": "SQL tutorial (PostgreSQL)", "url": "https://www.postgresql.org/docs/current/tutorial.html"}]
---

## Intro

If Python moves data and APIs transport it, SQL is where data actually *lives*. Today: tables, schemas, keys, joins, and enough SQL to query a real database without googling every line. We'll use SQLite because it's a single file with zero setup — but everything you learn transfers directly to Postgres.

## Read: Tables, schemas, and the one query shape

### Think in tables, not objects

A table is rows and columns with a fixed shape. That's it. The art is deciding **what's a row** and **what's a column**.

Bad: one `clubs` table with a column `members` holding a comma-separated string `"alice,bob,carol"`. You'll regret this the first time someone asks "how many students are in at least 2 clubs?"

Good: two tables, `clubs` and `memberships`, with a join.

### Keys and relationships

- **Primary key (PK):** unique row id. Usually `id INTEGER PRIMARY KEY`.
- **Foreign key (FK):** a column pointing at another table's PK.
- **One-to-many:** a club has many events. `events.club_id` references `clubs.id`.
- **Many-to-many:** students join many clubs, clubs have many students. Needs a join table.

```sql
CREATE TABLE clubs (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  founded   DATE
);

CREATE TABLE students (
  id        INTEGER PRIMARY KEY,
  roll_no   TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL
);

CREATE TABLE memberships (
  student_id INTEGER NOT NULL REFERENCES students(id),
  club_id    INTEGER NOT NULL REFERENCES clubs(id),
  joined_on  DATE NOT NULL,
  PRIMARY KEY (student_id, club_id)
);

CREATE TABLE events (
  id        INTEGER PRIMARY KEY,
  club_id   INTEGER NOT NULL REFERENCES clubs(id),
  title     TEXT NOT NULL,
  starts_at DATETIME NOT NULL,
  venue     TEXT
);
```

### The one query shape

Every SQL SELECT you'll write this semester fits this template:

```sql
SELECT   <columns>
FROM     <table>
JOIN     <other> ON <condition>
WHERE    <filter>
GROUP BY <columns>
HAVING   <filter on groups>
ORDER BY <columns>
LIMIT    <n>;
```

Not every query uses every clause, but the order is fixed.

### Joins without tears

```sql
-- Which events is each club running this week?
SELECT c.name, e.title, e.starts_at
FROM   clubs c
JOIN   events e ON e.club_id = c.id
WHERE  e.starts_at BETWEEN '2026-04-14' AND '2026-04-20'
ORDER  BY e.starts_at;
```

| Join | When |
|------|------|
| `INNER JOIN` | only rows that match in both tables |
| `LEFT JOIN` | all rows from left, even if no match right |
| `RIGHT JOIN` | opposite (rare; flip the tables instead) |
| `FULL OUTER` | union of both (rare) |

### Indexes are why databases are fast

A query like `WHERE roll_no = 'CS21B023'` on a million rows without an index is a full scan. Add:

```sql
CREATE INDEX idx_students_roll ON students(roll_no);
```

Now it's a tree lookup. But indexes cost on writes — don't index everything.

### Migrations, not `ALTER TABLE` in a GUI

Keep schema changes in numbered `.sql` files in `migrations/` and commit them. That's how every real team works.

```
migrations/
  001_init.sql
  002_add_events_venue.sql
  003_index_memberships.sql
```

Run them with `sqlite3 app.db < migrations/001_init.sql`.

## Watch: SQL in 20 minutes for people who already code

A fast tour of SELECT, JOIN, GROUP BY, and the common mistakes — `SELECT *` in production, forgetting `GROUP BY` columns, mixing up `WHERE` and `HAVING`.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for how the author builds a query incrementally — SELECT first, then WHERE, then JOIN.
- Notice when they reach for a subquery vs. a JOIN.
- See how `EXPLAIN QUERY PLAN` reveals index use.

## Lab: Campus clubs schema and queries

Design, migrate, seed, and query a small campus clubs database end-to-end with SQLite.

1. Install SQLite (usually preinstalled on macOS/Linux; on Windows: `winget install SQLite.SQLite`). Verify: `sqlite3 --version`.
2. Create project `clubs-db/`. Inside, make `migrations/`, `seeds/`, `queries/` folders.
3. Write `migrations/001_init.sql` with the 4 tables shown above (`clubs`, `students`, `memberships`, `events`). Include `FOREIGN KEY` constraints and `NOT NULL` where it matters.
4. Write `migrations/002_indexes.sql` with indexes on `memberships(club_id)`, `events(club_id)`, `events(starts_at)`.
5. Create the DB and run migrations:
   ```bash
   sqlite3 clubs.db < migrations/001_init.sql
   sqlite3 clubs.db < migrations/002_indexes.sql
   ```
6. Write `seeds/seed.sql` with 5 clubs, 20 students, ~30 memberships, 10 events. Use realistic names. Run it against `clubs.db`.
7. In `queries/`, write one SQL file per question:
   - `q1_clubs_by_size.sql` — clubs ordered by member count, largest first.
   - `q2_multi_club_students.sql` — students in 2+ clubs.
   - `q3_upcoming_events.sql` — events in the next 7 days, with club name.
   - `q4_inactive_clubs.sql` — clubs with zero events this semester. (Hint: `LEFT JOIN` + `WHERE events.id IS NULL`.)
8. Run each query: `sqlite3 clubs.db < queries/q1_clubs_by_size.sql`. Capture outputs in `queries/results.md`.
9. Open one query with `EXPLAIN QUERY PLAN` prefix and confirm it's using an index, not a full scan.
10. Commit. Your repo should be reproducible: anyone cloning it can run a single `make init` or `bash setup.sh` and get the same DB.

Stretch: port the same schema to Postgres locally (`docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres:16`), note any syntax you had to change (`AUTOINCREMENT` → `SERIAL`, dates, etc.).

## Quiz

Four questions on choosing between one-to-many and many-to-many, picking PKs vs. FKs, when to index, and reading a `JOIN` + `GROUP BY` query.

## Assignment

Submit the `clubs-db` repo. It must include the migrations, seed, four query files, a `results.md` with the output of each, and a `SCHEMA.md` with an ER diagram (a text sketch is fine; Mermaid is a bonus). One short paragraph in `NOTES.md` on a design decision you almost got wrong.

## Discuss: Schema choices have consequences

- Storing `tags` as a comma-separated column vs. a separate `tags` table. What problems does each cause six months later?
- Your club app suddenly needs "sub-clubs" (a club has child clubs). How do you change the schema with minimum pain?
- SQLite or Postgres for a hackathon project with 200 users? Defend your pick.
- A senior says "just use MongoDB, schemas slow you down." What are they right about and what are they missing?
