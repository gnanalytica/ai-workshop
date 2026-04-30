# Graph Report - .  (2026-04-30)

## Corpus Check
- Large corpus: 308 files · ~108,440 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 843 nodes · 1070 edges · 106 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Role Reorganization + Faculty Guides — Design (5 roles)` - 14 edges
2. `Faculty pods, mentor assignment, faculty experience — design spec` - 12 edges
3. `requireCapability/checkCapability` - 7 edges
4. `signUp()` - 6 edges
5. `Pre-Next.js static-HTML era (faculty.html, admin-faculty.html, vanilla ES modules) — ARCHIVED, no longer in tree` - 6 edges
6. `Plan 1 — Pods: Migrations, RPCs, RLS` - 6 edges
7. `parseScalarOrInline()` - 5 edges
8. `siteUrl()` - 5 edges
9. `clientIp()` - 5 edges
10. `rateOk()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `LessonDayView` --semantically_similar_to--> `TourMount/Tour`  [AMBIGUOUS] [semantically similar]
  web/components/lesson-day/LessonDayView.tsx → web/components/tour/Tour.tsx
- `Edge Functions Deploy` --shares_data_with--> `Environment Variables`  [INFERRED]
  RUNBOOK.md → README.md
- `Rotating Service Role Key` --references--> `Environment Variables`  [INFERRED]
  RUNBOOK.md → README.md
- `Next.js 15 App Router (single SPA under web/)` --superseded_by--> `Pre-Next.js static-HTML era (faculty.html, admin-faculty.html, vanilla ES modules) — ARCHIVED, no longer in tree`  [EXTRACTED]
  CLAUDE.md → docs/superpowers/archive/README.md
- `RBAC three personas: Admin / Faculty / Student` --superseded_by--> `ARCHIVED 5-role model: Admin / Trainer / Tech Support / Support Faculty / Executive Faculty (later collapsed to 3 personas)`  [INFERRED]
  CLAUDE.md → docs/superpowers/archive/2026-04-24-role-reorg-and-faculty-guides-design.md

## Hyperedges (group relationships)
- **Invite-code onboarding (preview → signup → claim)** —  [EXTRACTED 1.00]
- **Pod membership mutation flow (drag-drop → podEvent RPC)** —  [EXTRACTED 1.00]
- **Help desk triage (claim/resolve/escalate)** —  [EXTRACTED 1.00]
- **** — comp:GradingClient, action:batchGradeAssignment, action:publishGrade, action:manualGrade, page:admin/cohort/grading [INFERRED 0.90]
- **** — page:capstone, comp:CapstoneEditor, action:upsertMyCapstone, q:getMyCapstone [INFERRED 0.90]
- **** — route:api/help-chat, util:helpChatModel, util:retrieveHelp, q:getMyCurrentCohort [INFERRED 0.90]
- **Tour launch flow** —  [EXTRACTED 1.00]
- **Sandbox cohort UX** —  [EXTRACTED 0.95]
- **Handbook video composition** —  [EXTRACTED 1.00]
- **** — getTruePersona, getEffectivePersona, Persona [EXTRACTED 1.00]
- **** — sendMagicLink, startFlow, signUp [INFERRED 0.85]
- **** — STUDENT_TOUR, FACULTY_TOUR, ADMIN_TOUR [EXTRACTED 1.00]
- **** — concept:pods_structure, concept:pod_faculty_table, concept:pod_members_table [EXTRACTED 1.00]
- **** — concept:five_roles_archived, concept:profiles_staff_roles, concept:cohort_faculty_college_role [EXTRACTED 1.00]
- **** — doc:plan1_pods_migrations, doc:plan2_admin_pods_ui, doc:plan3_faculty_landing [INFERRED 0.80]

## Communities

### Community 0 - "App pages & routes"
Cohesion: 0.02
Nodes (4): dotClass(), statusKey(), getSupabaseServer(), requiredEnv()

### Community 1 - "UI primitives"
Cohesion: 0.04
Nodes (2): ageMs(), priorityBorder()

### Community 2 - "Shell, help & sandbox"
Cohesion: 0.06
Nodes (7): buildIndex(), getIndex(), retrieveHelp(), splitParagraphs(), stripFrontmatter(), tokenize(), trimSnippet()

### Community 3 - "RBAC archive (concepts)"
Cohesion: 0.05
Nodes (52): admin-pods.html admin UI for pods — ARCHIVED static-HTML page, Pre-Next.js static-HTML era (faculty.html, admin-faculty.html, vanilla ES modules) — ARCHIVED, no longer in tree, auth_caps(cohort uuid) Postgres SECURITY DEFINER function, Community board: board_posts/board_replies/board_votes tables, can_grade(submission) helper — admin-only authorization, can_grade_submission helper — trainer/admin always; support faculty pod-gated, Capabilities are the single source of truth (UI never checks role names), cohort_faculty.college_role ('support'/'executive') (+44 more)

### Community 4 - "Faculty pod & engagement actions"
Cohesion: 0.05
Nodes (4): actionFail(), withSupabase(), currentPath(), requireCapability()

### Community 5 - "Assignment submission flow"
Cohesion: 0.07
Nodes (2): classify(), splitDayPhases()

### Community 6 - "Community Q&A"
Cohesion: 0.08
Nodes (4): detect(), handleChange(), onKeyDown(), pick()

### Community 7 - "Capabilities + invites"
Cohesion: 0.09
Nodes (27): createInvite, /api/help-chat streaming endpoint, capability:orgs.write, capability:self.read, AppShell, AskAITab, CreateInviteForm, EnterSandboxButton (+19 more)

### Community 8 - "Invite actions"
Cohesion: 0.14
Nodes (12): claimInvite(), clientIp(), previewInvite(), rateOk(), redeemByKind(), resolveInviteKind(), safeNext(), sendMagicLink() (+4 more)

### Community 9 - "Persona & cookies"
Cohesion: 0.09
Nodes (23): FACULTY_COHORT_COOKIE, PREVIEW_COHORT_COOKIE, PREVIEW_COOKIE, PREVIEW_USER_COOKIE, UserProfile, getCurrentFacultyCohort, getDashboardKpis, getDayInteractive (+15 more)

### Community 10 - "Tours & navigation"
Cohesion: 0.1
Nodes (22): ADMIN_TOUR, CAPABILITIES, Capability, FACULTY_TOUR, NAV, NavGroup, NavItem, Persona (+14 more)

### Community 11 - "Faculty cohort board"
Cohesion: 0.11
Nodes (2): bulkRun(), moveMany()

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (8): back(), finish(), next(), onKey(), onResize(), skip(), tick(), update()

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (4): buildPrompt(), gradeWithAI(), manualGrade(), publishGrade()

### Community 14 - "Community 14"
Cohesion: 0.19
Nodes (6): addWorkingDays(), isWeekdayISO(), isWeekend(), parseDateUTC(), toISODate(), workingDayNumber()

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): Environment Variables, Quickstart, Cron Schedules, Cutover Steps, Edge Functions Deploy, Initial Setup Procedure, Migrations 0001-0009, pg_cron Scheduler (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (16): deletePod server action, podEvent server action, At-risk student classification, Pod drag-drop assignment pattern, FacultyCohortPage, FacultyDayPage, PodMembers (faculty pod view), FacultyPodPage (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (15): claimInvite server action, previewInvite server action, signUp server action, startFlow server action, ClaimForm, ClaimInvitePage, Invite-code onboarding flow, HomePage (marketing landing) (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.3
Nodes (9): listDays(), loadDay(), parseBlock(), parseInlineArray(), parseInlineArrayLike(), parseInlineObject(), parseScalarOrInline(), parseYamlSubset() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.2
Nodes (12): capability:support.triage, Help desk system, CohortStuckPage, StudentHelpDeskPage, LeaderboardPage, DashboardPage (learn), getMyCurrentCohort, listHelpDeskOpen (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (2): emptyDraft(), makeKey()

### Community 22 - "Community 22"
Cohesion: 0.2
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (10): claimInvite, previewInvite, rateOk, redeemByKind, resolveInviteKind, rpc_auth_rate_limit_check RPC, rpc_validate_invite RPC, sendMagicLink (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (9): batchGradeAssignment, manualGrade, publishGrade, capability:grading.write:cohort, GradingClient, AI grading workflow, AdminCohortGradingPage, listAssignmentSubmissions (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (8): upsertMyCapstone, capability:roster.read, CapstoneEditor, Capstone project, AdminCohortCapstonesPage, CapstonePage, getMyCapstone, listCohortCapstones

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (2): adminClient(), logNotification()

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (2): createInvite(), generateCode()

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (6): AssignmentBlock, CohortShell, CohortTabs, LessonDayView, PhaseTabs, DayPage

### Community 31 - "Community 31"
Cohesion: 0.6
Nodes (3): downloadCsv(), exportCsv(), toCsv()

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (5): createPod, capability:pods.write, CreatePodForm, PodsPage, listPods

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (4): Faculty Dashboard Sections, Faculty Handbook (Reference), Faculty Invite Code FAC-YCCUSG, Faculty Registration Flow

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (4): claimTicket, escalateTicket, resolveTicket, HelpDeskActions

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): capability:schedule.read, AdminHome, requireCapability

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (3): capability:community.read, capability:moderation.write, BoardPage (community)

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (2): claimInvite server action, signUp server action

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (3): ColumnDef<T>, DataTable<T>, DataTableProps<T>

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (3): getFacultyTodayKpis, listFacultyPodStudentIds, listHelpDeskOpen

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (2): README, RUNBOOK

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (2): Faculty Onboarding Guide, learn.gnanalytica.com

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (2): updateMyEmail, ChangeEmailForm

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (2): createAssignment, NewAssignmentForm

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (2): deleteAssignment, AssignmentsTable

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (2): createQuiz, NewQuizForm

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (2): HelpFab, HelpPanel

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): Restoring From Backup

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): Reset Cohort Data (staging)

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): Rebuild profiles from auth.users

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): Architecture Overview

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): Repository Layout

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): Tests

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): Personas + RBAC

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): SettingsProfilePage

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): QuizzesTable

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): HandbookAction

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): StudentDrawer

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): Tab navigation pattern

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): FacultyCohort

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): signOut

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): signInWithGoogle

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): getAdminCohortKpis

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): listRoster

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): listPods

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): listFaculty

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (1): listAssignments

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): listQuizzes

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): listTeams

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (1): getCohortPodRoster

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (1): listCohortDays

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (1): getCohortDay

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (1): todayDayNumber

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (1): listAssignmentSubmissions

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (1): submissions has no direct cohort_id; filter via assignments!inner(cohort_id)

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (1): Enrolled = registrations.status='confirmed' (no enrollments table)

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (1): Curriculum: web/content/day-XX.mdx with zod-validated frontmatter

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (1): Theme: HSL CSS variables in globals.css, persona via data-theme

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (1): Convention: data access in lib/queries; no from('…') in components

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (1): Convention: NNNN_description.sql migrations, drop+create policies

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (1): Deploy via GitHub push only — no Vercel CLI

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (1): Vercel project build-with-ai under team gnanalytica, Root web/

## Ambiguous Edges - Review These
- `LessonDayView` → `TourMount/Tour`  [AMBIGUOUS]
  None · relation: semantically_similar_to

## Knowledge Gaps
- **141 isolated node(s):** `RUNBOOK`, `Deploying Schema Changes`, `Rotating Service Role Key`, `Viewing Logs`, `Restoring From Backup` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 44`** (2 nodes): `NavSearch.tsx`, `onKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `service.ts`, `getSupabaseService()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `relTime.ts`, `relTime()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `README`, `RUNBOOK`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `Faculty Onboarding Guide`, `learn.gnanalytica.com`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `VideoPlayer.tsx`, `VideoPlayer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (2 nodes): `updateMyEmail`, `ChangeEmailForm`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (2 nodes): `createAssignment`, `NewAssignmentForm`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (2 nodes): `deleteAssignment`, `AssignmentsTable`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `createQuiz`, `NewQuizForm`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (2 nodes): `HelpFab`, `HelpPanel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `smoke.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `landing.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `public.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `trainer.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `student.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `admin.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `faculty.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `tech-support.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `Restoring From Backup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `Reset Cohort Data (staging)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `Rebuild profiles from auth.users`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `Architecture Overview`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `Repository Layout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `Tests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `Personas + RBAC`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `DataTable.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `database.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `SettingsProfilePage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `QuizzesTable`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `HandbookAction`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `StudentDrawer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `Tab navigation pattern`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `FacultyCohort`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `signOut`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `signInWithGoogle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `getAdminCohortKpis`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `listRoster`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `listPods`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `listFaculty`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `listAssignments`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (1 nodes): `listQuizzes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `listTeams`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (1 nodes): `getCohortPodRoster`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (1 nodes): `listCohortDays`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (1 nodes): `getCohortDay`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (1 nodes): `todayDayNumber`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (1 nodes): `listAssignmentSubmissions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (1 nodes): `submissions has no direct cohort_id; filter via assignments!inner(cohort_id)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `Enrolled = registrations.status='confirmed' (no enrollments table)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (1 nodes): `Curriculum: web/content/day-XX.mdx with zod-validated frontmatter`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (1 nodes): `Theme: HSL CSS variables in globals.css, persona via data-theme`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (1 nodes): `Convention: data access in lib/queries; no from('…') in components`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (1 nodes): `Convention: NNNN_description.sql migrations, drop+create policies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (1 nodes): `Deploy via GitHub push only — no Vercel CLI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (1 nodes): `Vercel project build-with-ai under team gnanalytica, Root web/`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `LessonDayView` and `TourMount/Tour`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What connects `RUNBOOK`, `Deploying Schema Changes`, `Rotating Service Role Key` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App pages & routes` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `UI primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Shell, help & sandbox` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `RBAC archive (concepts)` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Faculty pod & engagement actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._