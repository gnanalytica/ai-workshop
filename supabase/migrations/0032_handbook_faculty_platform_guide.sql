-- Faculty handbook: platform guide (pods, students, dashboard, community, help desk).
-- Ensures handbook_category exists for CI (mirrors hosted Supabase).

do $t$
begin
  create type handbook_category as enum ('technical', 'non_technical', 'day_by_day');
exception
  when duplicate_object then null;
end
$t$;

alter table faculty_pretraining_modules
  add column if not exists category handbook_category not null default 'non_technical';

insert into faculty_pretraining_modules (slug, title, body_md, ordinal, category)
values (
  'platform_faculty',
  'Using the workspace: dashboard, pods, students, help desk & community',
  $handbook$
## Sidebar (faculty)

Under **Dashboard** you will typically see:

- **Schedule** — Workshop calendar and links to faculty lesson views for each day.
- **Full cohort** — Cohort-wide KPIs, at-risk list, and the **pod board** (drag students between **Unassigned** and pods).
- **My pod** — Your **single assigned pod** in this cohort: students, signals, and (if you have permission) drag **You** onto a pod or **Unassigned** to change assignment.

Under **Setup**:

- **Manage pods** — Open the pod directory: create or delete pods, open a pod to attach **faculty** to that pod, and edit pod notes.

Under **Support**:

- **Help desk** — Triage tickets from learners. Your queue is **limited to students in pods you are on**; claim when you are helping, resolve when done, escalate when it needs platform or cohort staff.

Under **Reference**:

- **Community** — Cohort discussion board (post, reply, moderate per your permissions).
- **Leaderboard** — Student / pod / team standings.
- **Handbook** — This playbook.

## Pods and students

1. **Create pods** from **Full cohort** (Pods section) or **Manage pods**, if you have **pods.write**.
2. **Assign faculty to a pod** inside **Manage pods** → open a pod → Faculty list (add/remove). Each faculty member has **at most one pod per cohort**; adding them to a new pod moves them automatically.
3. **Place students** on **Full cohort**: use the board — drag chips, multi-select + bulk move, or drop onto a pod column. Students must sit in exactly one pod per cohort (or Unassigned until you place them).

## Help desk (faculty)

- You only see tickets from **your pod's students** (and matching triage rules on the server).
- If a ticket is missing, confirm you are on the right pod or ask a lead to add you under **Manage pods** → that pod → Faculty.

## Community

- Use **Community** in the sidebar for async Q&A and announcements-style discussion.
- Keep answers kind and specific; escalate repeated technical blockers via **Help desk** if needed.

## Quick checklist before live sessions

- [ ] **Schedule** — Know today's day number and live session time.
- [ ] **My pod** — Confirmed you are assigned to the pod you are supporting.
- [ ] **Full cohort** — Unassigned list empty or intentionally triaged.
- [ ] **Help desk** — Open items reviewed or delegated.
$handbook$,
  6,
  'non_technical'::handbook_category
)
on conflict (slug) do update set
  title = excluded.title,
  body_md = excluded.body_md,
  ordinal = excluded.ordinal,
  category = excluded.category;
