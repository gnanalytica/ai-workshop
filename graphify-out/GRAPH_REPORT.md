# Graph Report - web  (2026-04-27)

## Corpus Check
- Large corpus: 221 files · ~54,783 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 381 nodes · 607 edges · 35 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `siteUrl()` - 5 edges
2. `parseScalarOrInline()` - 5 edges
3. `parseDateUTC()` - 4 edges
4. `isWeekend()` - 4 edges
5. `addWorkingDays()` - 4 edges
6. `safeNext()` - 4 edges
7. `splitFrontmatter()` - 4 edges
8. `parseYamlSubset()` - 4 edges
9. `isWeekdayISO()` - 3 edges
10. `workingDayNumber()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Pages & admin surfaces"
Cohesion: 0.05
Nodes (2): getSupabaseServer(), requiredEnv()

### Community 1 - "Day UI & polls"
Cohesion: 0.06
Nodes (0): 

### Community 2 - "Content & org actions"
Cohesion: 0.07
Nodes (4): actionFail(), withSupabase(), currentPath(), requireCapability()

### Community 3 - "Shell, nav, inbox"
Cohesion: 0.09
Nodes (0): 

### Community 4 - "Discussion board"
Cohesion: 0.08
Nodes (4): detect(), handleChange(), onKeyDown(), pick()

### Community 5 - "Help desk & profile"
Cohesion: 0.08
Nodes (0): 

### Community 6 - "Auth & sign-in"
Cohesion: 0.15
Nodes (6): safeNext(), sendMagicLink(), signInWithGoogle(), signUp(), siteUrl(), startFlow()

### Community 7 - "Grading & submissions"
Cohesion: 0.12
Nodes (4): buildPrompt(), gradeWithAI(), manualGrade(), publishGrade()

### Community 8 - "Cohort scheduling"
Cohesion: 0.19
Nodes (6): addWorkingDays(), isWeekdayISO(), isWeekend(), parseDateUTC(), toISODate(), workingDayNumber()

### Community 9 - "Curriculum loader"
Cohesion: 0.2
Nodes (9): listDays(), loadDay(), parseBlock(), parseInlineArray(), parseInlineArrayLike(), parseInlineObject(), parseScalarOrInline(), parseYamlSubset() (+1 more)

### Community 10 - "Pod management"
Cohesion: 0.15
Nodes (0): 

### Community 11 - "Quiz authoring"
Cohesion: 0.22
Nodes (2): emptyDraft(), makeKey()

### Community 12 - "Invites"
Cohesion: 0.29
Nodes (2): createInvite(), generateCode()

### Community 13 - "Faculty cohort context"
Cohesion: 0.33
Nodes (0): 

### Community 14 - "Date formatting"
Cohesion: 0.29
Nodes (0): 

### Community 15 - "CSV export"
Cohesion: 0.6
Nodes (3): downloadCsv(), exportCsv(), toCsv()

### Community 16 - "Loading skeletons"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Attendance"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "Relative time"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Next env types"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Playwright config"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Vitest config"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Next.js config"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Test setup"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Smoke E2E"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Landing E2E"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Public E2E"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Trainer E2E"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Student E2E"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Admin E2E"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Faculty E2E"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Tech support E2E"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Ambient types"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Supabase DB types"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "App entry"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Relative time`** (2 nodes): `relTime.ts`, `relTime()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next env types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Playwright config`** (1 nodes): `playwright.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vitest config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test setup`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smoke E2E`** (1 nodes): `smoke.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing E2E`** (1 nodes): `landing.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Public E2E`** (1 nodes): `public.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Trainer E2E`** (1 nodes): `trainer.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Student E2E`** (1 nodes): `student.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin E2E`** (1 nodes): `admin.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Faculty E2E`** (1 nodes): `faculty.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tech support E2E`** (1 nodes): `tech-support.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ambient types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase DB types`** (1 nodes): `database.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App entry`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Pages & admin surfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Day UI & polls` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Content & org actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Shell, nav, inbox` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Discussion board` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Help desk & profile` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Grading & submissions` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._