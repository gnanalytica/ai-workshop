# Graph Report - .  (2026-04-25)

## Corpus Check
- 80 files · ~82,330 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 427 nodes · 552 edges · 54 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Plan 1 — Pods Migrations & RLS` - 11 edges
2. `Spec — Faculty Pods Design` - 11 edges
3. `renderBody()` - 9 edges
4. `refresh()` - 9 edges
5. `Day 22 — Agentic AI: ReAct, LangGraph, MCP` - 9 edges
6. `Spec — Role Reorganization + Faculty Guides` - 9 edges
7. `mountAdminPollsTab()` - 8 edges
8. `renderGuide()` - 8 edges
9. `Plan 3 — Faculty Landing: Today + Handbook` - 8 edges
10. `processCohort()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Milestone Days (D10/15/21/25/30)` --references--> `Capstone M2 — Idea Lock+Features (D11)`  [INFERRED]
  RUNBOOK.md → content/day-11.md
- `Milestone Days (D10/15/21/25/30)` --references--> `Capstone M3 — Pitch+Mini Demo (D16)`  [INFERRED]
  RUNBOOK.md → content/day-16.md
- `Milestone Days (D10/15/21/25/30)` --references--> `Capstone M1 — Idea/Research (D6)`  [EXTRACTED]
  RUNBOOK.md → content/day-06.md
- `Platform Architecture Quick Reference` --cites--> `Supabase Backend (Postgres+Auth+Edge+Storage)`  [EXTRACTED]
  RUNBOOK.md → CLAUDE.md
- `Platform Architecture Quick Reference` --cites--> `Edge Functions (digest+registration emails)`  [EXTRACTED]
  RUNBOOK.md → CLAUDE.md

## Hyperedges (group relationships)
- **Week 1 — AI Foundations & Prompting** — day_01, day_02, day_03, day_04, day_05, day_06 [EXTRACTED 1.00]
- **Week 2 — Problem Framing & Capstone Lock** — day_07, day_08, day_09, day_10, day_11 [EXTRACTED 1.00]
- **Capstone Milestone Arc** — capstone_milestone_1, capstone_milestone_2, capstone_milestone_3, runbook_milestone_days [EXTRACTED 1.00]
- **Agentic stack: ReAct + LangGraph + tools + chat UI** — react_loop, langgraph, crewai, three_node_pattern, chainlit [EXTRACTED 0.90]
- **Pods data substrate (tables + RPC + RLS)** — cohort_pods_table, pod_faculty_table, pod_members_table, pod_faculty_events_table, rpc_pod_faculty_event, pods_rls_policies [EXTRACTED 0.95]
- **Five-plan faculty pods rollout** — plan_pods_migrations_rls, plan_admin_pods_ui, plan_faculty_landing, plan_my_pod_cohort, plan_analytics_mentor_card [EXTRACTED 1.00]

## Communities

### Community 0 - "Admin Pods UI"
Cohesion: 0.07
Nodes (33): admin-pods.html page, assets/pods.js helper module, cohort_pods table, CSV import with preview diff, loadFacultyAnalytics, Rationale: faculty drill-down is full-write across whole cohort, faculty.html with hash-routed tabs, Faculty removal guardrail (block while owns pods) (+25 more)

### Community 1 - "Admin Polls Tab"
Cohesion: 0.11
Nodes (29): addOptRow(), closeDrawer(), closeEdit(), collectOpts(), confirmDialogRef(), esc(), filteredPolls(), loadCounts() (+21 more)

### Community 2 - "Capstone & Project Conventions"
Cohesion: 0.07
Nodes (31): Capstone M1 — Idea/Research (D6), Capstone M2 — Idea Lock+Features (D11), Capstone M3 — Pitch+Mini Demo (D16), Architecture Notes (non-obvious), Project Conventions, Project CLAUDE.md Guidance, Context Engineering (CLAUDE.md/AGENTS.md), Edge Functions (digest+registration emails) (+23 more)

### Community 3 - "Student Drawer"
Cohesion: 0.13
Nodes (21): buildRecentActivity(), computeKpis(), esc(), fmtDate(), initialsOf(), kpiCell(), mountDrawer(), openDrawer() (+13 more)

### Community 4 - "Workshop Capstone Phase (Days 21-23)"
Cohesion: 0.16
Nodes (17): Anthropic — Building effective agents, Chainlit chat UI, CrewAI (multi-agent orchestration), .env.local secrets pattern, Day 21 — Milestone 4: Workspace Setup and First Deploy, GitHub→Vercel→Supabase deploy pipeline, Day 22 — Agentic AI: ReAct, LangGraph, MCP, Day 23 — Cost Estimation of AI (+9 more)

### Community 5 - "Faculty Guide Renderer"
Cohesion: 0.25
Nodes (15): buildInstructorScript(), esc(), getSectionBlock(), getSetupState(), inferCohortDay(), parseAgendaRows(), parseBullets(), parseNumberedActions() (+7 more)

### Community 6 - "Role Reorg & Faculty Hub"
Cohesion: 0.13
Nodes (16): announcements.deleted_at soft-delete, Rationale: big-bang rollout, single staging→prod cutover, Community board (board_posts/replies/votes), Rationale: UI gates read can.* not role names, cohort_faculty.college_role column (support/executive), Escalation lanes (student→support→tech/trainer), faculty-guide.html (replaces pretraining LMS), Five role model (Admin, Trainer, Tech Support, Support Faculty, Exec Faculty) (+8 more)

### Community 7 - "Content Markdown Renderer"
Cohesion: 0.2
Nodes (9): coerceValue(), domainOf(), escapeHtml(), parseFrontmatter(), parseModules(), renderFrontmatterHeader(), renderLesson(), renderObjective() (+1 more)

### Community 8 - "Demo Days & Ethics (Days 27-30)"
Cohesion: 0.15
Nodes (14): Alumni network + post-cohort cadence, Day 27 — AI ethics, safety, guard-rails, red-teaming, Day 28 — GEO, leaderboards, benchmarking, Day 29 — Demo Day 1, Day 30 — Demo Day 2 + cohort closing, India DPDP Act 2023, 5-minute demo structure (cold open→problem→demo→arch→ask), 6 GEO levers (citations, structure, schema, brand, freshness, direct answers) (+6 more)

### Community 9 - "Edge Function Email Templates"
Cohesion: 0.32
Nodes (11): btn(), buildTemplate(), button(), escapeHtml(), fmtTime(), footerDates(), greeting(), processCohort() (+3 more)

### Community 10 - "Nav Search & Command Palette"
Cohesion: 0.29
Nodes (8): bindGlobalFindShortcut(), buildLessonIndex(), ensurePaletteDom(), esc(), openCommandPalette(), prependNavFind(), runPaletteQuery(), snippet()

### Community 11 - "Theme & Modal Helpers"
Cohesion: 0.25
Nodes (5): getTheme(), paintIcon(), setTheme(), toggleTheme(), wireThemeToggle()

### Community 12 - "Day Rail Navigation"
Cohesion: 0.36
Nodes (7): getDashboardSectionFromHash(), initCourseNavDrawer(), loadDayRailState(), mountDayRail(), mountStudentDayRail(), setInitialWeekOpenState(), teardownCourseNavUI()

### Community 13 - "Cohort Analytics"
Cohesion: 0.29
Nodes (6): cohortStartDate(), emptyWeekBuckets(), loadCohortExecSummary(), loadCohortWeekTimeSeries(), loadPodAnalytics(), weekBucketsToArray()

### Community 14 - "Admin/Faculty Auth Gate"
Cohesion: 0.28
Nodes (4): computeCaps(), renderAccountMenuHtml(), renderViewSwitcher(), resolveRoles()

### Community 15 - "Stream Activity Feed"
Cohesion: 0.39
Nodes (7): attachStreamDisplayNames(), esc(), loadStream(), renderStream(), todayEndIso(), todayStartIso(), tpl()

### Community 16 - "Chart Kit (Faculty Charts)"
Cohesion: 0.67
Nodes (8): basePlugins(), destroyFacultyChart(), facultyChartColors(), facultyDoughnutChart(), facultyHBarChart(), facultyLineChart(), facultyVBarChart(), loadChart()

### Community 17 - "Problem Framing Frameworks (Day 7-8)"
Cohesion: 0.22
Nodes (9): 5 Whys, Design Thinking 5-stage loop, Heilmeier Catechism, How Might We, SCQA Pitch Structure, Systems Thinking / Causal Loops, Day 7: Heilmeier/5 Whys/HMW, Day 8: Design Thinking 5-stage Loop (+1 more)

### Community 18 - "Admin Nav Chrome"
Cohesion: 0.36
Nodes (5): initAdminNavChrome(), renderAdminNav(), resolveRoleSet(), syncAdminNavGroups(), wrapAdminMainLayout()

### Community 19 - "Community Board"
Cohesion: 0.38
Nodes (3): esc(), renderMarkdown(), renderTagPill()

### Community 20 - "Dialog & Toast Helpers"
Cohesion: 0.4
Nodes (2): ensureToast(), toast()

### Community 21 - "Pods Helper Module"
Cohesion: 0.33
Nodes (0): 

### Community 22 - "LLM Evals & Tracing (Day 25)"
Cohesion: 0.33
Nodes (6): Day 25 — Local LLMs, prompt patterns, evals, tracing, Hamel Husain — Your AI app needs evals, LangSmith (trace viewer), Ollama (local LLM runtime), OpenEvals (LangChain eval harness), Three prompt patterns (role+format, few-shot, scratchpad)

### Community 23 - "Faculty Section Registry"
Cohesion: 0.4
Nodes (0): 

### Community 24 - "Assignments Review Strip"
Cohesion: 0.4
Nodes (0): 

### Community 25 - "Agenda Tab"
Cohesion: 0.6
Nodes (3): esc(), fmtDT(), renderAgenda()

### Community 26 - "Board Recent Widget"
Cohesion: 0.67
Nodes (2): esc(), mountBoardRecent()

### Community 27 - "Polls Widget"
Cohesion: 0.5
Nodes (0): 

### Community 28 - "Faculty Tabs Mount"
Cohesion: 0.67
Nodes (2): mountFacultySection(), mountFacultyTab()

### Community 29 - "Student Row Component"
Cohesion: 1.0
Nodes (3): chip(), escape(), renderStudentRow()

### Community 30 - "Stuck & Attendance Tab"
Cohesion: 0.83
Nodes (3): esc(), pad(), renderStuckAttendance()

### Community 31 - "Prompting Frameworks (Day 3)"
Cohesion: 0.5
Nodes (4): Chain-of-Thought Prompting, CREATE Prompting Framework, Few-shot Prompting, Day 3: Prompting Guide CREATE/few-shot/CoT

### Community 32 - "Deployment Stack (Day 17-18)"
Cohesion: 0.5
Nodes (4): Day 17: Git/GitHub/localhost/APIs, Day 18: Deployment Vercel+Supabase, Supabase, Vercel

### Community 33 - "Audio/Video Generation (Day 24)"
Cohesion: 0.5
Nodes (4): Day 24 — Text2Audio, Text2Video, ElevenLabs voice cloning, HeyGen avatar, Google Veo 3 text-to-video

### Community 34 - "Student Nav"
Cohesion: 1.0
Nodes (2): esc(), renderStudentNav()

### Community 35 - "My Pod View"
Cohesion: 0.67
Nodes (0): 

### Community 36 - "Embedded Docs Renderer"
Cohesion: 0.67
Nodes (0): 

### Community 37 - "Pre-training Tab"
Cohesion: 1.0
Nodes (2): esc(), renderTraining()

### Community 38 - "Faculty Action Strip"
Cohesion: 1.0
Nodes (2): esc(), renderFacultyActionStrip()

### Community 39 - "AI Foundations (Day 1-2)"
Cohesion: 0.67
Nodes (3): Tokens / Weights / Attention, Day 1: What AI is and is not, Day 2: Inside an LLM (tokens/weights/attention)

### Community 40 - "Grounded Research (Day 5)"
Cohesion: 0.67
Nodes (3): Day 5: Grounded Research (Fast/Thinking/Deep), NotebookLM, Perplexity

### Community 41 - "Workflow Automation (Day 13)"
Cohesion: 0.67
Nodes (3): Day 13: Workflow & Browser Automation (n8n), Firecrawl, n8n Automation

### Community 42 - "User Research Methods (Day 9)"
Cohesion: 0.67
Nodes (3): Jobs-to-be-Done, The Mom Test, Day 9: User Interviews / Mom Test / JTBD

### Community 43 - "Open Source & Indic Models (Day 4)"
Cohesion: 0.67
Nodes (3): Day 4: Open Source Models & Indian Stack, Hugging Face, Sarvam AI (Indic)

### Community 44 - "AI Presentation Tools (Day 14)"
Cohesion: 0.67
Nodes (3): Day 14: AI Presentations (Gamma/Kimi/Canva), Canva, Gamma AI

### Community 45 - "Handbook Section Renderer"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Handbook Page"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Student Signals"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Faculty People Tab"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Cohort Selector"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Brand Visual Assets"
Cohesion: 1.0
Nodes (2): Gnanalytica Favicon Mark, 30-Day AI Workshop OG Banner

### Community 51 - "Days Helper"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Text-to-Image (Day 12)"
Cohesion: 1.0
Nodes (1): Day 12: Text2Image (Stable Diffusion/Firefly)

## Knowledge Gaps
- **90 isolated node(s):** `Before Day 1 Setup Checklist`, `Admin Hub Reference Table`, `Weekly Rituals`, `Common Scenarios Troubleshooting`, `Project Conventions` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Handbook Section Renderer`** (2 nodes): `handbook-section.js`, `renderHandbookSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Handbook Page`** (2 nodes): `handbook.js`, `renderHandbook()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Student Signals`** (2 nodes): `signals.js`, `loadStudentSignals()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Faculty People Tab`** (2 nodes): `people-tab.js`, `renderFacultyPeople()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cohort Selector`** (2 nodes): `cohort.js`, `renderCohort()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Brand Visual Assets`** (2 nodes): `Gnanalytica Favicon Mark`, `30-Day AI Workshop OG Banner`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Days Helper`** (1 nodes): `days.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabase.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Text-to-Image (Day 12)`** (1 nodes): `Day 12: Text2Image (Stable Diffusion/Firefly)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plan 4 — Faculty My pod + Whole cohort` connect `Admin Pods UI` to `Student Drawer`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Spec — Faculty Pods Design` connect `Admin Pods UI` to `Role Reorg & Faculty Hub`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `Before Day 1 Setup Checklist`, `Admin Hub Reference Table`, `Weekly Rituals` to the rest of the system?**
  _90 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Pods UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Admin Polls Tab` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Capstone & Project Conventions` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Student Drawer` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._