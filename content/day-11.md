---
reading_time: 14 min
tldr: "Apps are spreadsheets in disguise. Learn to sketch schemas and read queries; AI writes them."
tags: ["concepts", "data", "mental-model"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Schema-sketching and SQLBolt", "url": "https://sqlbolt.com/"}
resources: [{"title": "SQLBolt", "url": "https://sqlbolt.com/"}, {"title": "MDN: Databases", "url": "https://developer.mozilla.org/en-US/docs/Glossary/Database"}]
---

## Intro

Apps forget everything when they close. Databases are how software remembers. Today you learn to *think* in tables, rows, keys, and queries — without typing a single query. By the end you'll be able to sketch the data model of any app on a napkin.

## Read: Tables, relationships, queries

### The core intuition: apps are spreadsheets in disguise

Almost every app you use — Swiggy, Classroom, LinkedIn — is, under the hood, a small set of spreadsheets linked to each other. A **table** is one spreadsheet. A **row** is one record. A **column** is one attribute. A **primary key** is the unique ID per row. A **foreign key** is how one table points to another.

Here's Dunzo's likely data model in four tables:

```
users                          orders
-------------                  ---------------
id (PK)                        id (PK)
name                           user_id  (FK -> users.id)
phone                          restaurant_id (FK -> restaurants.id)
created_at                     total
                               status
                               created_at

restaurants                    order_items
-------------                  ---------------
id (PK)                        id (PK)
name                           order_id  (FK -> orders.id)
lat, lng                       menu_item_id (FK -> menu_items.id)
open_now                       quantity
```

Read it twice. This is *the* mental model.

> A well-designed schema is 60% of a good app. Everything else is plumbing.

### Why relationships matter

If you kept everything in one giant table — user, their orders, the items, the restaurants — you'd have duplication, inconsistency, and chaos. Splitting into related tables is called **normalization**. Joining them back at query time gives you the view you want.

Three common relationship shapes:

| Shape | Example |
|---|---|
| One-to-one | A user has one profile |
| One-to-many | A user has many orders |
| Many-to-many | A student applies to many companies; a company sees many students |

Many-to-many always needs a **join table** (here: `applications`).

### SQL: the language of questions

SQL is how you **ask questions** of a database. You will not write SQL this month. You should be able to read it.

```
Example — you're reading, not typing.

SELECT name, cgpa
FROM students
WHERE cgpa > 8.5
ORDER BY cgpa DESC
LIMIT 10;
```

Translation: *Give me the top 10 students by CGPA above 8.5, name and CGPA only.* SQL is almost English when you squint.

A join looks like this:

```
Example — you're reading, not typing.

SELECT students.name, applications.company, applications.status
FROM students
JOIN applications ON applications.student_id = students.id
WHERE applications.status = 'shortlisted';
```

Translation: *Show me every student shortlisted somewhere, with the company and status.*

The six keywords you'll see 95% of the time: `SELECT`, `FROM`, `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`. That's it.

### SQL vs NoSQL, the honest intuition

| | SQL (Postgres, MySQL, SQLite) | NoSQL (MongoDB, Firestore, DynamoDB) |
|---|---|---|
| Mental model | Spreadsheets with relationships | Nested documents (like JSON) |
| Schema | Strict — you declare it upfront | Flexible — shape can vary per doc |
| Good at | Complex queries, transactions, reports | Huge scale of simple lookups, changing shapes |
| Bad at | Nested / evolving data | Complex joins across collections |
| You'll meet it in | Most apps, always | Chat apps, real-time, specific niches |

Default to SQL. Reach for NoSQL when you have a concrete reason.

### The three questions a schema must answer

When you (or an AI) designs a data model, pressure-test it with:

1. **What's the unit?** (Is the row a user, an order, an event?)
2. **What's unique about it?** (What's the primary key?)
3. **What does it relate to?** (Which foreign keys?)

If you can answer those three for every table, the rest of the design falls out.

### Reading vs writing, cache vs source of truth

Real apps read data 100x more often than they write it. So they **cache**. Instagram doesn't query the DB every time you open the app — it serves your feed from a cache, which is a faster, less-durable copy. The DB remains the **source of truth**. Caches go stale; sources of truth do not.

```
   write --> [ source-of-truth DB ]
                   |
                   v  (refreshed occasionally)
             [ cache ]
                   ^
                   |
   read ----------+
```

Stale caches are responsible for 40% of "why is my profile pic still the old one" bugs.

### A campus-flavoured example: the placement data model

Tables you'd sketch for a placement portal:

- `students` (id, roll_no, name, branch, cgpa, resume_url)
- `companies` (id, name, sector, ctc_min, ctc_max)
- `jobs` (id, company_id, title, eligibility_cgpa, deadline)
- `applications` (id, student_id, job_id, status, applied_at)
- `interviews` (id, application_id, round, scheduled_at, result)

Five tables, four relationships, and you've modelled your college's entire placement cell. That's the power of thinking in tables.

## Watch: Database fundamentals in 10 minutes

One clear visual explainer of tables, keys, and joins. Optional second video on SQL vs NoSQL.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for the word **join**.
- Notice that "relational" really just means "tables that point at each other".
- Spot the moment they explain a primary key vs a foreign key.

## Lab: Schema-sketching + SQLBolt (45 min)

You will not write a single query. You will sketch and read.

1. **Scenario**: your college is rolling out a campus placement portal. You're given a messy Google Sheet where someone dumped everything into one tab. On paper or Excalidraw, design the **clean schema** — 4–6 tables, with columns and primary/foreign keys marked. 10 minutes, no code.
2. Swap with a partner (or re-read after a break). Critique: are there missing relationships? Over-normalized tables? Missing keys?
3. Open `https://sqlbolt.com/`. Work through lessons 1, 2, and 3. These are read-heavy; the site gives you the query, you read the result.
4. Without running new queries, **read** 5 provided SQL statements and, on your worksheet, translate each into plain English.
5. Draw the ER diagram (entity-relationship diagram) for SQLBolt's `movies` example. Boxes for tables, lines for relationships.
6. Identify one query that would need a **JOIN** and one that doesn't. Explain why in a sentence.
7. On paper, list the top 3 questions you'd expect the placement cell to ask their database ("how many CS students placed?", etc.). For each, name the tables involved.
8. Export the schema sketch + the worksheet.

Submit both.

## Quiz

4 questions: identify primary vs foreign key in a diagram, translate a simple `SELECT ... WHERE` in English, spot a many-to-many relationship, and explain why a cache and a DB can disagree.

## Assignment

Pick an app and sketch its data model in 4–6 tables on one page. Mark primary keys, foreign keys, and at least one many-to-many. Write a one-paragraph justification for your choices. Submission: a diagram PNG/PDF + paragraph. No code.

## Discuss: Thinking in rows

- Your hostel WhatsApp group has 200 messages a day. What would the `messages` table look like, and what indexes would you want?
- A dating app "sees" only profiles of the opposite preference. Is this a database filter or an application-layer filter? Does it matter?
- Why do transactions (the banking kind) almost always live in SQL, not NoSQL?
- When Netflix shows you "trending in India" — is that computed per-request or cached? What gives it away?
- A classmate claims "we don't need a database, we'll store everything in a JSON file". When is that fine, and when does it break?
