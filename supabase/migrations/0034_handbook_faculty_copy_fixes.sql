-- Handbook copy fixes: UI labels (Teams, Move pod, Escalate to staff), Faculty page title, pods.write, follow-up, checklist.
update faculty_pretraining_modules
set
  body_md = $hb$
## Sidebar (faculty)

Under **Dashboard** you will typically see:

- **Schedule** — Workshop calendar, cohort dates, and links to a **read-only lesson view** for each day (same curriculum as students, from the faculty path). The product defaults to 30 days, but the **All days** grid follows whatever is configured for the cohort in **cohort days**.
- **Full cohort** — (Nav: **Full cohort**; page title on screen: **Faculty**.) Cohort-wide KPIs, an **at-risk** list, and the **pod board** (drag students between **Unassigned** and pods, multi-select, bulk moves).
- **My pod** — Your **single assigned pod** in this cohort: roster, at-risk/activity signals, shortcuts to the help desk and **Today’s lesson**, and—if you have **pods.write**—the **Your pod assignment** card where you drag **You** between pods or **Unassigned**.

Under **Setup**:

- **Manage pods** — For users with **pods.write**: open the **pod directory** for the cohort, create or delete pods, add optional notes, and open each pod to assign **faculty** and **members**. Link out to the **cohort board** for bulk student moves.

Under **Support**:

- **Help desk** — (With **support.triage**.) Triage open tickets from learners in your scope. The main list is **unresolved** work; use **View resolved →** for history and paging.

Under **Reference**:

- **Community** — Cohort discussion (post, reply, moderate per permissions).
- **Leaderboard** — **Students**, **Pods**, and **Teams** tabs; links to a student on the **Students** tab where shown. The page explains how **cumulative score** is calculated.
- **Handbook** — This module. In the app, this guide lives on **Handbook** under the **Role & Operations** tab (it is a **non-technical** / operations module), alongside any other content your cohort has there.

---

## Creating and managing pods (pods.write)

You need the **Manage pods** nav item, which is gated by the **pods.write** capability (not every faculty user has it).

1. **Open the directory** — **Setup → Manage pods** (`/pods`). You’ll see the cohort name, a count of pods and placed students, and a grid of pod cards.
2. **Create a pod** — Use **New pod** (or “Create first pod”): set a name and optional **Mentor note** (optional field in the form), then **Create pod**. You can also start from the **Full cohort** screen → **Pods** when that **Create a pod** card is available.
3. **Open a pod** — From the grid, open a pod to its detail page. There you can:
   - **Faculty** — Add or remove faculty who are already on the **cohort faculty roster**. Each faculty member has **at most one pod per cohort**; assigning them here moves them if they were on another pod.
   - **Members** — Add students from the **unassigned** pool, or remove members back to unassigned. Students must be **confirmed** enrollments; the UI explains that bulk moves are often easier on the **cohort board**.
   - **Shared notes** — Shown on the pod header when set (same data as the mentor note you can set at create time).
   - **Delete pod** — Removes the pod when your role allows; confirm destructive actions. Prefer moving people first.
4. **Cohort board vs pod screen** — The **Faculty** (Full cohort) screen’s drag-and-drop **board** is best for **many students at once**; the pod detail screen is best for **named roster work** and **faculty** assignment.
5. **Activity** — Pod detail can show a short **Recent activity** event list (adds, moves, etc.) for audit.

If you do not see **Manage pods**, ask a cohort lead to grant **pods.write** or handle pod changes for you.

---

## Full cohort: board and at-risk

- **Pods** — Use the **board** to place every student in exactly **one** pod (or **Unassigned** until you’re ready). Drag chips, drop on columns, or use multi-select and bulk move when available.
- **At-risk** — Use the at-risk list as a triage input; open a **student** from a row to see full context (scores, help desk, notes).

---

## Schedule and day lessons

- **Schedule** lists every **cohort day** with titles and links (often Day 1…30, but the count depends on how the cohort is configured).
- **Faculty day pages** are **read-only** views of the same lesson experience students see—use them to prep live sessions and office hours. The schedule uses **Open today’s lesson →**; **My pod** also links to **Today’s lesson** and `/faculty/day/today`.

---

## My pod

- Your **home** for “who am I supporting?”: pod roster, the **day strip** (today’s day/title, live time when set), and badges for help desk, **to review** (submissions in your pod that still need a human pass—e.g. submitted, or AI-graded but not yet human-reviewed), and at-risk. Links go to the help desk, the **Full cohort** (Faculty) screen, and **Today’s lesson**. If you are **unassigned** to a pod, use **Your pod assignment** (if you have **pods.write**) or ask a lead to add you.

---

## Student profile (drill) page

Open a student from **Full cohort**, **My pod**, the **Leaderboard**, or anywhere you see their name as a link.

The drill page is your **one-stop** view for that learner:

- **Header** — Name, email, current **pod** (or none). Actions may include **Email**, **Copy email**, **Move pod** (choose a target pod, then **Move**), and **Unassign**—subject to the same **pods.write** and pod rules as elsewhere.
- **KPIs** — Total **score** (if enabled), **labs done**, **last active**, and a count of **recent help desk** items.
- **Score breakdown** — How points split across **quiz**, **submissions**, **posts**, **comments**, **upvotes** when scoring is on. Weights are aligned with the **Leaderboard** experience.
- **Pod notes** — Cohort-scoped notes visible to pod faculty. Use **Flag for follow-up** (and **Needs follow-up** badges) to track follow-ups.
- **Recent submissions** — Assignment name, day, **submitted/graded** status, and score if present.
- **Help desk (recent)** — A short history for this student (not the full org queue).
- **Recent board** — Community posts with links to open the thread.

Use this page before escalating or when joining mid-cohort to understand context.

---

## Help desk: open queue vs history

- **Main Help desk** (`/faculty/help-desk`) — **Open** (non-resolved) tickets in your allowed scope (typically students **in pods you are on**). **Claim** a ticket to start helping; when it is fixed, use **Resolve**. If trainers, cohort staff, or platform need to own it, use **Escalate to staff** and add a note. The main queue can also be filtered (for example to **tech**-tagged work). If something is missing, read the in-page **scope** notice.
- **View resolved** (`/faculty/help-desk/history`) — **Resolved** and older items with **pagination** for handoffs, audits, and “what did we do last time?”

If a student’s issue does not appear, confirm you are on the right pod, or ask a lead to add you under that pod’s **faculty** list.

---

## Leaderboard

- Tabs: **Students**, **Pods**, and **Teams** (when your cohort uses teams). Sorting and scoring follow the same cumulative rules described at the top of the page.
- Use it for motivation and spot checks; open a **student** from the **Students** tab when you need the full drill.

---

## Community

- **Community** in the sidebar is the cohort **async** space for Q&A and announcements-style threads.
- Keep answers specific; route repeated **technical** blockers through **Help desk** so they are tracked. Moderate per your **permissions**.

---

## Quick checklist before live sessions

- [ ] **Schedule** — Day number, session time, and lesson opened once in **faculty** read-only view.
- [ ] **My pod** — You are assigned to the pod you are supporting (or you have a plan with leads). Glance at **to review** and at-risk.
- [ ] **Full cohort** (Faculty) — Unassigned list empty or intentionally triaged; **at-risk** scanned.
- [ ] **Pods** — If you manage pods, names and **faculty** assignments match reality.
- [ ] **Help desk** — Open items are **claimed** or clearly owned; nothing critical is idle.
- [ ] **Handbook** — Skim this page when onboarding or when navigation changes.
$hb$
where slug = 'platform_faculty';
