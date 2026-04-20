# Instructor Runbook

The day-by-day manual for running a cohort on this platform.

---

## Before Day 1 (setup checklist)

1. **Supabase dashboard** — confirm all edge function secrets are set:
   - `RESEND_API_KEY` (status-change email)
   - `RESEND_FROM` (optional; defaults to `onboarding@resend.dev`)
   - `TRIGGER_SECRET` (DB trigger → edge function header; also stored in `webhook_config`)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (Meet provisioning)
   - `INSTRUCTOR_EMAIL` (who owns provisioned Meet rooms)

2. **Google Admin** — verify domain-wide delegation for the service account with scope `https://www.googleapis.com/auth/meetings.space.created`.

3. **Enrollment code** — confirm `COHORT01` is live (default), or create a new code in `/admin-orgs.html`.

4. **Cohort branding** — `/admin-orgs.html` → set logo, primary color, tagline.

5. **Create Meet rooms** — `/admin-teams.html` → Provision Meet rooms. Creates one main cohort Meet + one per team after teams are assigned.

6. **Assign faculty** (if any) — `/admin-faculty.html` → paste email + pick cohort + role.

7. **Test enrollment** — sign up with a throwaway email using the code. Verify magic link arrives and redirects to dashboard.

---

## Each teaching day (60-min live session)

### Before class (~30 min)

- [ ] Open `/admin-home.html` — check the **At-risk students** list. Decide who to check in with today.
- [ ] `/admin-schedule.html` — verify today's day is unlocked + session time set + Meet link present.
- [ ] `/admin-polls.html` — queue the day's polls from the day's "In-class moments" block:
  - Opening cold-open poll (30s answer)
  - Mid-lecture concept check (1 min)
  - End-of-class reflection poll
- [ ] Skim the day's content page to remember the specific lab + discussion prompts.
- [ ] `/admin-announcements.html` — post any last-minute announcement (Meet link change, schedule shift, etc.).

### During class (60 min)

Follow the day's **"Today's 1-hour live session"** agenda table and **"In-class moments"** block.

Key moves during class:

- [ ] **00:05** — launch the cold-open poll from `/admin-polls.html`. Wait 30s. Share screen + read results live.
- [ ] **00:15** — think-pair-share; give breakout rooms if in Meet, or let students pair in chat.
- [ ] **00:30** — mid-lecture poll or activity. Monitor `/admin-stuck.html` for raised hands.
- [ ] **00:45** — debate/breakout activity. Faculty TAs handle stuck queue.
- [ ] **00:55** — one-line reflection in chat.

### After class (~20 min)

- [ ] `/admin-home.html` — check **Recent activity**. Respond to any open stuck queue entries.
- [ ] `/admin-announcements.html` — optional: post recap + link to tonight's homework.
- [ ] If it was a milestone day (D10/15/21/25/30) — go to `/admin-content.html` and click **Assign peer reviewers (2 per submission)** once submissions arrive.

---

## Weekly rituals

### Friday (or Week wrap)

- [ ] `/admin-teams.html` → **Accountability buddies** → Auto-pair this week's buddies.
- [ ] `/admin-polls.html` → create/launch a "best of the week" vote (most useful prompt, most creative artifact, etc.).
- [ ] Grade pending milestone submissions (`/admin-content.html` → the milestone → inline grading with rubric).
- [ ] Post weekly announcement: featured students, winners, what's coming next.

### Sunday (prep for next week)

- [ ] `/admin-schedule.html` → unlock upcoming week's days (use **Select week** + **Enable selected**).
- [ ] Review next week's lesson content — any updates to make?
- [ ] Check Resend dashboard — any bounces/failures on magic-link emails?

---

## Milestone days (D10, D15, D21, D25, D30)

### D10 — Capstone kickoff

- [ ] Run the ideathon format in class (see Day 10 agenda — 5/10/15/20/10 structure).
- [ ] End-of-day: review submitted one-pagers; approve or push back.
- [ ] Assign peer reviewers after submissions come in.

### D15 — Locked spec

- [ ] After class: mark milestone assignments.
- [ ] Assign peer reviewers.
- [ ] In `/admin-teams.html`: confirm all students are in a team by end of day.

### D21 — v0 prototype

- [ ] Check submitted URLs — do they actually load? Any broken?
- [ ] Assign peer reviewers.
- [ ] Monitor stuck queue closely — this week students hit the wall most.

### D25 — Mini-demo

- [ ] Use `/admin-polls.html` → **Create team-vote poll** to run live voting during demos.
- [ ] Record the session if possible.
- [ ] Mark milestone submissions.

### D30 — Final demo day

- [ ] Prepare panel (external judges, alumni, etc.).
- [ ] Use team-vote poll again.
- [ ] `/admin-teams.html` → flip **is_featured** star on standout capstones → they appear on `/hall-of-fame.html`.
- [ ] Announce winners via `/admin-announcements.html`.
- [ ] Certificates auto-issue on `/certificate.html` for students with 30/30 progress.

---

## Common scenarios

### "A student can't sign up"
- Check `/admin-orgs.html` → enrollment code — is it expired or at max uses?
- Check Supabase Auth logs for SMTP errors (default: dashboard → Logs → auth).

### "A student hasn't logged in for a week"
- Admin home → At-risk list. DM them via the platform's cohort directory or external channel.

### "Meet rooms aren't working"
- `/admin-teams.html` → Provision Meet rooms button → re-provision.
- Verify service account secrets still set in Supabase.

### "A student's work is private but I need to see it"
- `/admin-student.html?u=<user_id>` — admin drill-down shows all their submissions, notes, quiz attempts.

### "I want to send one email to all students"
- `/admin-announcements.html` — posts on their dashboard. If you need email too, do it outside the platform (the platform only sends transactional emails).

---

## Admin hub reference

| Page | Use when |
|---|---|
| `admin-home.html` | Default landing — today's status, at-risk, pending |
| `admin.html` | Registrations (approve/confirm/waitlist) |
| `admin-schedule.html` | Unlock days, set session times, Meet links |
| `admin-content.html` | Create/edit quizzes + assignments + rubrics + grading |
| `admin-teams.html` | Team CRUD, auto-pair, Meet provision, buddy pairs, Feature star |
| `admin-attendance.html` | Live attendance grid, mark manually, CSV export |
| `admin-polls.html` | Launch live polls during class |
| `admin-stuck.html` | Live "I'm stuck" queue during studio days |
| `admin-activity.html` | Live feed of everything happening in the cohort |
| `admin-student.html` | Per-student drill-down (all their submissions, notes, quiz history) |
| `admin-analytics.html` | Cohort stats, signups, completion heatmap, leaderboard |
| `admin-orgs.html` | Orgs + enrollment codes (admin only) |
| `admin-announcements.html` | Post cohort-wide messages with severity levels |
| `admin-faculty.html` | Assign faculty/TA roles (admin only) |

---

## Platform architecture (quick reference)

- **Frontend**: static HTML/CSS/JS on GitHub Pages, auto-deployed from `main` branch of `gnanalytica/ai-workshop`
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Project ref**: `qvqlpcnvculkrjpkdrwi`
- **Edge functions**:
  - `send-registration-email` — triggered by DB on `registrations.status` change
  - `provision-meets` — invoked by admin button on `/admin-teams.html`
- **Storage bucket**: `submissions` — student file uploads, private, 10MB cap

---

*This runbook lives at `RUNBOOK.md` in the repo. Update as the cohort evolves.*
