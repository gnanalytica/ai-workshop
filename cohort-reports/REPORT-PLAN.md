# Day-20 rubric-scored cohort report — build plan & findings

Goal (user): Regenerate the cohort activity report **scored by rubric, with Claude
freshly grading submissions, capped at day ≤ 20**, delivered as a **new Google Sheet**.

Cohort: `fbd78241-7d28-434b-aa55-0659bb614be7` (kbn-internship-2026-05), ~158 students,
3 named pods (BSC_COMPUTERS, II BSC(AI), INTERN SHIP DS/STAT) + Unassigned.

## Decisions locked with user
- **Grading:** fresh-grade ALL days 1–20 submissions with Claude (subagents), against full rubrics.
- **Day cap:** strict day ≤ 20 (cap quiz set, assignment set, AND activity denominator at 20).
- **Output:** new native Google Sheet in user's Drive (Drive integration), share link back.
- **Coverage gap:** AUTHOR descriptive rubrics for every rubric-less day in 1–20 (match
  Day 6–10 quality bar), show user for approval, then grade.
- **Grader bug:** FIX it in code (separate small change, own review).
- OPEN: write ai_score back to DB vs read-only scratch (defaulting read-only unless told).

## Scoring formula (from migration 0093_v_student_score_balanced.sql)
total (0–100) = 0.35*quiz + 0.35*submission + 0.30*activity
- quiz: avg over every published quiz (missing=0)
- submission: avg over weight>0 non-reflection assignments, coalesce(score, ai_score, 0)
- activity: distinct unlocked days touched / unlocked_days * 100
For the report, recompute the same but filter quizzes/assignments/days to day_number <= 20.

## Per-assignment scoring model (locked with user)
- Each assignment scored OUT OF 10, via 3-5 weighted criteria, each w/ partial-credit anchors
  (criteria-level granularity — NOT per-sub-instruction checklist).
- Sheet shows BOTH raw /10 and normalized % (x10) per assignment.
- submission_score (per student) = avg of assignment % over graded days 1-20, reflections (weight 0) excluded.
- % feeds the 35% submission slice of balanced total (0093 formula). DB ai_score is 0-100 → store as %.

## Rubric audit findings
- Rich rubrics exist ONLY for Days 6,7,8,9,10 (migration 0102). All set via the single
  `update assignments set rubric_id=...` in 0102. Everything else has rubric_id=NULL.
- Rubric JSON shape (good, descriptive): criteria[] each {key,name,max,anchors{0..N}},
  plus scale_max and auto_grade_hints{red_flags[],evidence_required[]}.
- GAP days needing authored rubrics (1–20): 1,2,3,4,5,12,13,14,15,16,17,18,19,20.
  (Day 11 = recap, no submission. Days 1 & reflections weight 0 — confirm whether to skip.)
- Assignment titles per day: see migration 0111_backfill_daily_assignments.sql (authoritative
  list). Day 13 also has an extra "Academic topic deck" (0103). Day 16 vibe-coding (0110).
  Day 20 deploy+link (0112). Briefs live in web/content/day-XX.mdx prose above the form.

## GRADER BUG (confirmed, real) — fix needed
1. web/lib/actions/submissions.ts ~line 126-128: rubric criteria jsonb is a WRAPPER object
   `{criteria:[...], scale_max, auto_grade_hints}`, but code does `Array.isArray(rubricRaw)`
   on the wrapper → always null → grader ignores rubric. Fix: read `rubricRaw.criteria`.
2. web/lib/ai/grade.ts: AIGradeInput.rubricCriteria typed as {name,weight,description} and
   buildPrompt only renders name/weight/description. But real items are {key,name,max,anchors}.
   So even after fix #1, anchors+max (the descriptive instructions) are dropped. Fix: extend
   the type + buildPrompt to render max points and anchor ladder per criterion.
   NOTE: app grader uses Gemini 2.5 Flash (gemini-2.5-flash) via @ai-sdk/google — NOT Claude.
   Our report grading uses Claude subagents with the FULL rubric, bypassing this path.

## Access status
- Supabase MCP: NOT yet authorized (OAuth pending). CLI not logged in, no web/.env.local.
  Re-trigger mcp__plugin_supabase_supabase__authenticate, user opens URL, tools activate.
- Neon MCP tools ARE available (mcp__Neon__run_sql etc.) — but project linkage unconfirmed;
  Supabase is the intended backend. Prefer Supabase MCP execute_sql once authorized.
- Google Sheet: will use claude_ai_Google_Drive create_file (needs Drive integration).

## Existing artifacts in cohort-reports/
- student-activity-report.html — prior Day-12 report (activity-only, NOT rubric-scored), template to mirror.
- student-activity-2026-05-18.csv — Day-12 raw export.
- chart.min.js — vendored Chart.js.
- 0103_rename_submissions_to_assignment_submissions.sql — STRAY dup of migrations/0104; candidate to delete.

## Next steps (resume order)
1. Author gap-day rubrics (1–5,12–20) as a migration or scratch JSON; get user approval.
2. Apply grader bug fix (submissions.ts + grade.ts) on a branch.
3. Authorize Supabase MCP; verify live rubric coverage + count days1–20 submissions (token/time estimate).
4. Fresh-grade via Claude subagents (parallel), capturing score+strengths+weaknesses per submission.
5. Recompute capped score per student; build summary tabs (pod avgs, at-risk, quiz weak spots).
6. Create Google Sheet, share, return link.
