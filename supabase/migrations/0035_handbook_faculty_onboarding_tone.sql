-- Faculty platform handbook: onboarding tone — no internal capability/DB names (pods.write, support.triage, etc.).
update faculty_pretraining_modules
set
  body_md = $hb$
## Sidebar (faculty)

Under **Dashboard** you will typically see:

- **Schedule** — Workshop calendar, cohort dates, and links to a **read-only lesson view** for each day (same curriculum as students, from the faculty path). The **All days** list follows how your program scheduled the workshop (often on the order of a month of days, but the exact count depends on your cohort).
- **Full cohort** — (Nav: **Full cohort**; page title on screen: **Faculty**.) Cohort-wide stats, an **at-risk** list, and the **pod board** (drag students between **Unassigned** and pods, multi-select, bulk moves when available).
- **My pod** — Your **single assigned pod** in this cohort: roster, activity signals, shortcuts to the help desk and **Today’s lesson**, and—if your program allows you to self-assign—**Your pod assignment** so you can drag **You** onto a pod or **Unassigned**.

Under **Setup**:

- **Manage pods** — If this appears for you, it opens the **pod directory** for the cohort: create or rename pods, add optional notes, and open a pod to assign **faculty** and **members**. You can also jump to the **cohort board** to move many students at once. If you don’t see it, a cohort lead can create pods and adjust rosters for you.

Under **Support**:

- **Help desk** — Open requests from learners you’re responsible for. The main list is work that is still open; use **View resolved** for past items and history.

Under **Reference**:

- **Community** — Cohort discussion: post, reply, and (when your program allows) help keep threads on track.
- **Leaderboard** — **Students**, **Pods**, and **Teams** tabs; you can open a student from the **Students** tab when the table links to a profile. The page explains how scores add up.
- **Handbook** — This module. You’ll find it under the **Handbook** entry in the sidebar, on the **Role & Operations** tab, together with any other program guides your cohort has published there.

---

## Creating and managing pods

If you have a **Manage pods** (or **Setup → Manage pods**) item, use it; not everyone’s role includes pod admin.

1. **Open the directory** — **Setup → Manage pods**. You’ll see the cohort name, a count of pods and placed students, and a grid of pod cards.
2. **Create a pod** — Use **New pod** (or “Create first pod”): set a name and an optional **Mentor note**, then **Create pod**. You can also start from the **Full cohort** screen in the **Pods** section when a **Create a pod** block is there.
3. **Open a pod** — From the grid, open a pod to work on it:
   - **Faculty** — Add or remove faculty who are on the **cohort roster**. Each faculty member is on **at most one pod** in this cohort; adding someone here can move them from another pod.
   - **Members** — Add students from **Unassigned**, or move them back. Enrolled students can be placed on a pod; the board is often the fastest way to move many at once.
   - **Shared notes** — Shown on the pod when set (same idea as the mentor note you can add when creating a pod).
   - **Delete pod** — Only when the app allows; confirm before removing. Move people out first when possible.
4. **Cohort board vs pod screen** — The **Faculty** (Full cohort) **board** is best for **bulk** student moves; the pod page is for **roster and faculty** details.
5. **Activity** — Pod pages can show a short **Recent activity** list (moves, adds, and similar) for a quick audit trail.

If you never see **Manage pods**, ask your lead to set up pods or to give you the access your program uses for pod changes.

---

## Full cohort: board and at-risk

- **Pods** — Use the **board** so each student is in **one** pod, or in **Unassigned** until you’re ready. Drag chips, use multi-select, or bulk move when the UI offers it.
- **At-risk** — Use this list to prioritize check-ins; open a **student** to see more context (scores, help desk, notes).

---

## Schedule and day lessons

- **Schedule** lists each **workshop day** with titles and links.
- **Faculty day pages** are **read-only** and mirror what students see—good for prep and office hours. From **Schedule** use **Open today’s lesson**; **My pod** also links to **Today’s lesson**.

---

## My pod

- A simple **home** for “who am I supporting?”: your pod roster, **today’s** day and title (and live time if set), and shortcuts to help desk, work **to review** (for example submissions in your pod that need a final human look), and **at-risk** counts. Follow links to the help desk, **Full cohort**, and the lesson for today. If you have **no pod yet**, use **Your pod assignment** when the card is available, or ask a lead to add you to a pod.

---

## Student profile (drill) page

Open a student from **Full cohort**, **My pod**, the **Leaderboard**, or any linked name.

You’ll see:

- **Header** — Name, email, current **pod** (or none). You may have **Email**, **Copy email**, **Move pod** (pick a pod, then **Move**), and **Unassign**, depending on what your program allows for pod moves.
- **KPIs** — **Score** (if used), **labs done**, **last active**, and **recent help desk** counts.
- **Score breakdown** — How points from quizzes, submissions, posts, and similar show up. Compare with the **Leaderboard** page for the big picture.
- **Pod notes** — Team-visible notes. Use **Flag for follow-up** and watch for **Needs follow-up** when something needs a callback.
- **Recent submissions** — What they turned in and status (submitted, graded, etc.).
- **Help desk (recent)** — A short per-student slice (not the full org queue).
- **Recent board** — Community posts with links to the thread.

Use this view before escalating or when you’re new to a cohort.

---

## Help desk: open vs history

- **Help desk** (main list) — Items that are still **open** for the learners you support. **Claim** when you start helping, **Resolve** when it’s done. **Escalate to staff** with a short note if someone above your role needs to take over. You can use filters in the list (for example to focus on more technical items). If something you expect is missing, read the short **scope** note on the page.
- **View resolved** — Older, **closed** items, with **pages** to scroll back for handoffs or follow-up.

If a case doesn’t show up, check that you’re on the right pod, or ask a lead to add you to that pod’s **faculty** list there.

---

## Leaderboard

- **Students**, **Pods**, and **Teams** (when your cohort uses teams). Scoring is explained at the top of the page; use it to celebrate progress and spot who might need a nudge. Open a **student** from the table when the link is there.

---

## Community

- **Async** Q&A and announcements. Keep answers specific; send **repeat technical blockers** through **Help desk** so they get tracked. Help keep discussions respectful and on topic when that’s part of your role.

---

## Quick checklist before live sessions

- [ ] **Schedule** — You know the day and time, and you’ve glanced at today’s lesson in read-only view.
- [ ] **My pod** — You know which pod you’re with (or you have a plan with your lead). Glance at **to review** and at-risk.
- [ ] **Full cohort** — Unassigned list is triaged; **at-risk** scanned.
- [ ] **Pods** — If you help run pod setup, names and rosters look right; otherwise, you’ve checked with the lead.
- [ ] **Help desk** — Open items are picked up; nothing critical is left hanging.
- [ ] **Handbook** — Skim this page when you’re new or when navigation changes.
$hb$
where slug = 'platform_faculty';