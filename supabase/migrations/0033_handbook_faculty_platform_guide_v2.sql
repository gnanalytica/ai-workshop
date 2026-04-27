-- Expand faculty platform handbook: pods (create/manage), student drill, schedule/day, help desk vs history, leaderboard.
update faculty_pretraining_modules
set
  body_md = $hb$
## Sidebar (faculty)

Under **Dashboard** you will typically see:

- **Schedule** — 30-day workshop calendar, cohort dates, and links to a **read-only lesson view** for each day (same curriculum as students, from the faculty path).
- **Full cohort** — Cohort-wide KPIs, an **at-risk** list, and the **pod board** (drag students between **Unassigned** and pods, multi-select, bulk moves).
- **My pod** — Your **single assigned pod** in this cohort: students, signals, shortcuts to help desk and today’s lesson, and (if you have permission) a way to move **You** between pods or **Unassigned**.

Under **Setup**:

- **Manage pods** — For users with **pods.write**: open the **pod directory** for the cohort, create or delete pods, add optional notes, and open each pod to assign **faculty** and **members**. Link out to the **cohort board** for bulk student moves.

Under **Support**:

- **Help desk** — (with **support.triage**) Triage open tickets from learners in your scope. The main list is **unresolved** work; use **View resolved** for history and paging.

Under **Reference**:

- **Community** — Cohort discussion (post, reply, moderate per permissions).
- **Leaderboard** — **Student**, **Pod**, and **Team** tabs for standings; links to open a student for detail where shown.
- **Handbook** — This module.

---

## Creating and managing pods (pods.write)

You need the **Manage pods** nav item, which is gated by the **pods.write** capability (not every faculty user has it).

1. **Open the directory** — **Setup → Manage pods** (`/pods`). You’ll see the cohort name, a count of pods and placed students, and a grid of pod cards.
2. **Create a pod** — Use **New pod** (or “Create first pod”): set a name and optional mentor **note**, then create. You can also start from **Full cohort** → **Pods** when that shortcut exists.
3. **Open a pod** — From the grid, open a pod to its detail page. There you can:
   - **Faculty** — Add or remove faculty who are already on the **cohort faculty roster**. Each faculty member has **at most one pod per cohort**; assigning them here moves them if they were on another pod.
   - **Members** — Add students from the **unassigned** pool, or remove members back to unassigned. Students must be **confirmed** enrollments; the UI explains that bulk moves are often easier on the **cohort board**.
   - **Shared notes** — Pod-level text visible in context.
   - **Delete pod** — Removes the pod when your role allows; confirm destructive actions. Prefer moving people first.
4. **Cohort board vs pod screen** — The **Cohort** page’s drag-and-drop **board** is best for **many students at once**; the pod detail screen is best for **named roster work** and **faculty** assignment.
5. **Activity** — Pod detail can show a short **Recent activity** event list (adds, moves, etc.) for audit.

If you do not see **Manage pods**, ask a cohort lead to grant **pods.write** or handle pod changes for you.

---

## Full cohort: board and at-risk

- **Pods** — Use the **board** to place every student in exactly **one** pod (or **Unassigned** until you’re ready). Drag chips, drop on columns, or use multi-select and bulk move when available.
- **At-risk** — Use the at-risk list as a triage input; open a **student** from a row to see full context (scores, help desk, notes).

---

## Schedule and day lessons

- **Schedule** lists **Day 1…30** (or your cohort’s configured range) with titles and links.
- **Faculty day pages** are **read-only** views of the same lesson experience students see—use them to prep live sessions and office hours. Use **Go to day** (or the **My pod** shortcut to “today” when present) to jump quickly.

---

## My pod

- Your **home** for “who am I supporting?”: pod roster, **signals** or summaries when shown, and links to **Full cohort**, **help desk**, and **today’s** lesson. If you are **unassigned** to a pod, follow the in-app callout to join a pod or ask a lead to add you.

---

## Student profile (drill) page

Open a student from **Full cohort**, **My pod**, the **Leaderboard**, or anywhere you see their name as a link.

The drill page is your **one-stop** view for that learner:

- **Header** — Name, email, current **pod** (or none). Actions may include **Email**, **Copy email**, **Move to another pod** (picks a target pod), and **Unassign** from the current pod—subject to the same **pods.write** / pod rules as elsewhere.
- **KPIs** — Total **score** (if enabled), **labs done**, **last active**, and a count of **recent help desk** items.
- **Score breakdown** — How points split across **quiz**, **submissions**, **posts**, **comments**, **upvotes** when scoring is on.
- **Pod notes** — Cohort-scoped notes visible to pod faculty; mark **follow-up** when you need a reminder.
- **Recent submissions** — Assignment name, day, **submitted/graded** status, and score if present.
- **Help desk (recent)** — A short history for this student (not the full org queue).
- **Recent board** — Community posts with links to open the thread.

Use this page before escalating or when joining mid-cohort to understand context.

---

## Help desk: open queue vs history

- **Main Help desk** (`/faculty/help-desk`) — **Open** (non-resolved) tickets you are allowed to see—typically students **in pods you are on**. **Claim** when you are actively helping; **resolve** when done; **escalate** or route to **tech** when the platform or staff must take over. Read the **scope** notice on the page if something looks missing.
- **View resolved** (`/faculty/help-desk/history`) — Older, **resolved** items with **pagination**. Use it for handoffs, audits, and “what did we do last time?”

If a student’s issue does not appear, confirm you are on the right pod, or ask a lead to add you under that pod’s **faculty** list.

---

## Leaderboard

- Tabs: **Students**, **Pods**, and **Teams** (when your cohort uses teams). Sorting and point rules match your cohort’s configuration.
- Use it for motivation and spot checks; open a **student** from the table when you need the full drill.

---

## Community

- **Community** in the sidebar is the cohort **async** space for Q&A and announcements-style threads.
- Keep answers specific; route repeated **technical** blockers through **Help desk** so they are tracked. Moderate per your **permissions**.

---

## Quick checklist before live sessions

- [ ] **Schedule** — Day number, session time, and lesson opened once in **faculty** read-only view.
- [ ] **My pod** — You are assigned to the pod you are supporting (or you have a plan with leads).
- [ ] **Full cohort** — Unassigned list empty or intentionally triaged; **at-risk** scanned.
- [ ] **Pods** — If you manage pods, names and **faculty** assignments match reality.
- [ ] **Help desk** — Open items **claimed** or **delegated**; nothing critical unowned.
- [ ] **Handbook** — Skim this page when onboarding or when navigation changes.
$hb$
where slug = 'platform_faculty';