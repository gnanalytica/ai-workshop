# Graph Report - .  (2026-04-27)

## Corpus Check
- 273 files · ~88,216 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 551 nodes · 875 edges · 45 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.74)
- Token cost: 0 input · 45,199 output

## God Nodes (most connected - your core abstractions)
1. `Plan 1 — Pods Migrations & RLS` - 11 edges
2. `Spec — Faculty Pods Design` - 11 edges
3. `Spec — Role Reorganization + Faculty Guides` - 9 edges
4. `Plan 3 — Faculty Landing: Today + Handbook` - 8 edges
5. `Plan 1 — Role Foundations (Schema + Auth)` - 7 edges
6. `Plan 4 — Faculty My pod + Whole cohort` - 7 edges
7. `RBAC Model (single source of truth)` - 7 edges
8. `Plan 2 — Admin Pods UI` - 6 edges
9. `siteUrl()` - 5 edges
10. `parseScalarOrInline()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Rebuild profiles from auth.users` --shares_data_with--> `RBAC Model (single source of truth)`  [INFERRED]
  RUNBOOK.md → CLAUDE.md
- `RBAC Model (single source of truth)` --rationale_for--> `Personas + RBAC`  [INFERRED]
  CLAUDE.md → README.md
- `Faculty Onboarding Guide` --conceptually_related_to--> `RBAC Model (single source of truth)`  [INFERRED]
  docs/faculty-onboarding.md → CLAUDE.md
- `Environment Variables` --shares_data_with--> `Edge Functions Deploy`  [INFERRED]
  README.md → RUNBOOK.md
- `Rotating Service Role Key` --references--> `Environment Variables`  [INFERRED]
  RUNBOOK.md → README.md

## Hyperedges (group relationships)
- **Pods data substrate (tables + RPC + RLS)** — cohort_pods_table, pod_faculty_table, pod_members_table, pod_faculty_events_table, rpc_pod_faculty_event, pods_rls_policies [EXTRACTED 0.95]
- **Five-plan faculty pods rollout** — plan_pods_migrations_rls, plan_admin_pods_ui, plan_faculty_landing, plan_my_pod_cohort, plan_analytics_mentor_card [EXTRACTED 1.00]
- **RBAC Capability Resolution Pattern** — claudemd_auth_caps, claudemd_has_cap, claudemd_require_capability, runbook_rbac_events [EXTRACTED 0.90]
- **Deploy / Schema-Change Pipeline** — runbook_migrations, runbook_rbac_spec_verify, runbook_edge_functions_deploy, runbook_cutover [EXTRACTED 0.85]
- **Daily Digest Cron Flow** — runbook_send_daily_digest, runbook_pg_cron, runbook_cron_schedules [EXTRACTED 0.90]

## Communities

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 0 - "App Routes & Auth Pages"
Cohesion: 0.04
Nodes (2): getSupabaseServer(), requiredEnv()

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Layouts & Cohort Switcher"
Cohesion: 0.13
Nodes (0): 

### Community 10 - "Sign-up & Auth Forms"
Cohesion: 0.15
Nodes (6): safeNext(), siteUrl(), sendMagicLink(), startFlow(), signUp(), signInWithGoogle()

### Community 2 - "Handbook & Markdown UI"
Cohesion: 0.06
Nodes (6): handleChange(), detect(), pick(), onKeyDown(), statusKey(), dotClass()

### Community 7 - "Pod Management UI"
Cohesion: 0.07
Nodes (2): bulkRun(), moveMany()

### Community 5 - "Profile & Browser Supabase"
Cohesion: 0.07
Nodes (0): 

### Community 20 - "Loading Skeletons"
Cohesion: 0.5
Nodes (0): 

### Community 13 - "Cohort Calendar Math"
Cohesion: 0.19
Nodes (6): parseDateUTC(), toISODate(), isWeekend(), isWeekdayISO(), addWorkingDays(), workingDayNumber()

### Community 1 - "Admin Schedule/Roster/Polls"
Cohesion: 0.06
Nodes (2): ageMs(), priorityBorder()

### Community 12 - "AI Grading Pipeline"
Cohesion: 0.12
Nodes (4): gradeWithAI(), buildPrompt(), publishGrade(), manualGrade()

### Community 14 - "Quiz Editor"
Cohesion: 0.13
Nodes (2): makeKey(), emptyDraft()

### Community 8 - "Orgs/Teams/Kudos/CheckIn"
Cohesion: 0.08
Nodes (2): actionFail(), withSupabase()

### Community 9 - "Invites & RBAC Gate"
Cohesion: 0.08
Nodes (4): requireCapability(), currentPath(), generateCode(), createInvite()

### Community 17 - "Format Helpers (date/esc)"
Cohesion: 0.29
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Curriculum MDX Loader"
Cohesion: 0.3
Nodes (9): splitFrontmatter(), parseYamlSubset(), parseBlock(), parseScalarOrInline(), parseInlineArray(), parseInlineObject(), parseInlineArrayLike(), loadDay() (+1 more)

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 4 - "App Shell & Search"
Cohesion: 0.09
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Relative Time"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "CSV Export"
Cohesion: 0.6
Nodes (3): toCsv(), downloadCsv(), exportCsv()

### Community 21 - "Daily Digest Template"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "Email Edge Function"
Cohesion: 0.4
Nodes (2): adminClient(), logNotification()

### Community 3 - "Legacy Static-HTML Plans"
Cohesion: 0.08
Nodes (35): Plan 3 — Faculty Landing: Today + Handbook, faculty.html with hash-routed tabs, assets/faculty-tabs.js router, Today tab module, Handbook tab module, routeAfterSignIn helper, Plan 5 — Analytics + Student Mentor Card, loadPodAnalytics (+27 more)

### Community 15 - "RBAC Role Foundations"
Cohesion: 0.13
Nodes (16): Plan 1 — Role Foundations (Schema + Auth), profiles.staff_roles column (admin/trainer/tech_support), cohort_faculty.college_role column (support/executive), announcements.deleted_at soft-delete, SQL role helpers (has_staff_role, college_role_in, can_grade_submission), resolveRoles() + capability map, Rationale: additive-only migrations isolate risk from RLS rewrite, Spec — Role Reorganization + Faculty Guides (+8 more)

### Community 23 - "Top-Level Docs"
Cohesion: 1.0
Nodes (3): RUNBOOK, README, CLAUDE.md Agent Guide

### Community 6 - "Ops Runbook Procedures"
Cohesion: 0.08
Nodes (29): Initial Setup Procedure, Migrations 0001-0009, RBAC Spec Verification, Edge Functions Deploy, Deploying Schema Changes, Rotating Service Role Key, Viewing Logs, Cron Schedules (+21 more)

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Restoring From Backup

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Repository Layout

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Tests

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Conventions

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Deployment Workflow

### Community 22 - "Faculty Onboarding"
Cohesion: 0.5
Nodes (4): Faculty Invite Code FAC-YCCUSG, Faculty Registration Flow, Faculty Dashboard Sections, Faculty Handbook (Reference)

## Knowledge Gaps
- **45 isolated node(s):** `faculty.html with hash-routed tabs`, `assets/faculty-tabs.js router`, `Today tab module`, `Handbook tab module`, `routeAfterSignIn helper` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 25`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `smoke.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `landing.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `public.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `trainer.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `student.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `admin.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `faculty.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `tech-support.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `database.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Relative Time`** (2 nodes): `relTime.ts`, `relTime()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `Restoring From Backup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Repository Layout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Conventions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Deployment Workflow`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Spec — Faculty Pods Design` connect `Legacy Static-HTML Plans` to `RBAC Role Foundations`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `Spec — Role Reorganization + Faculty Guides` connect `RBAC Role Foundations` to `Legacy Static-HTML Plans`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `faculty.html with hash-routed tabs`, `assets/faculty-tabs.js router`, `Today tab module` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Routes & Auth Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Layouts & Cohort Switcher` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Handbook & Markdown UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Pod Management UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._