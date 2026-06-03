# Grading progress ledger (resume here)

Paused on account usage limit (resets ~8:50pm IST 2026-05-30). DB state is source of truth —
re-run the ledger query in REPORT-PLAN/worklist to refresh. ai_score is 0-100; grades UNPUBLISHED.

Project: ucqatbscxgborqsgnrjl · Cohort: fbd78241-7d28-434b-aa55-0659bb614be7
Method: subagent per assignment reads cohort-reports/GRADING-INSTRUCTIONS.md (RUBRIC_SOURCE db or file:<key>).

## Status snapshot (graded / gradeable)
DONE (100%):
- D1 Score-your-own 146/146 (avg 65.9)
- D2 Context Window 155/155 (68.6)
- D2 Tokenize 155/155 (33.8)
- D3 CREATE rewrite 157/157 (57.5)
- D4 Three models Indic 157/157 (59.6)
- D7 Sharpen M1 157/157 (44.9)
- D10 Causal-loop 154/154 (35.9)
- D20 Context earns tokens 40/40 (40.4)

PARTIAL (resume — grade only ai_graded is not true):
- D5 Same question three depths 144/158  (assignment 7b237acd-3aff-4140-8a8d-6ac5e54eabe0, db)
- D6 Capstone M1 105/156            (c5a9b369-8eeb-45d0-9034-498d7cbb2318, db)
- D6 5 ideas w/ refs 136/145        (2bfed2f3-5ade-4f42-8b2d-52483a0857e1, db)
- D8 Design-thinking loop 117/155   (ad53a58b-2d1a-4922-9dbf-b10d25e64608, db)
- D9 User Interview 120/151         (d4c06caa-4356-4e73-b2ff-66fce678f0da, db)

NOT STARTED (0 graded):
- D11 x10 tracks — all share rubric_id b96cf01c... RUBRIC_SOURCE=file:day11_shell_fix
    50f590a9 E-commerce Rec Engine; b11657cd Fake News; ac71e01d Hospital Triage;
    5daf24a1 Data Audit; 3085a7fa Expense Tracker; 61484232 LMS Monitor;
    50c24c8b Attendance Scout; c7205451 Bus Stop; 7290f6e0 Greenhouse; fd51c995 Sentiment
- D12 52b89d89 (img dup) + 2915f986 (img lab)  RUBRIC_SOURCE=file:day12
- D13 b0140e6f (academic deck) + 02afb928 (capstone deck)  file:day13
- D14 a2bfa66c (n8n)  file:day14
- D15 e832bb84 (ReAct)  file:day15
- D16 ae1de383 (Milestone 3)  file:day16_milestone3 ; 73b4893a (portfolio)  file:day16_portfolio
- D17 160c3c77 (repo+API)  file:day17
- D18 402f9812 (cost sheet)  file:day18

EXCLUDED: day19 e8191b09 (google-form link, no content); all reflections (weight 0).

## Totals
~1743 / 4643 graded so far. ~2900 remaining (D11 ~1320 is the bulk; D12-18 ~1085; stragglers ~163).

## RESUME RECIPE (when limit resets)
1. Refresh ledger query (group by assignment, graded vs gradeable).
2. For PARTIAL: same subagent prompt but add to the fetch WHERE: `and s.ai_graded is not true`.
3. For NOT STARTED: spawn subagent per assignment pointing at GRADING-INSTRUCTIONS.md with the
   listed RUBRIC_SOURCE. Run in waves of ~6-8 to respect limits; D11's 10 tracks are big — pace them.
4. Then: recompute capped(<=20) balanced score per student (task #5), build Sheet (task #6).

## Remaining non-grading tasks
- #2 Fix rubric-aware grader bug in web/lib/actions/submissions.ts (unwrap .criteria) + grade.ts (anchors/max).
- #5 Recompute score; #6 Google Sheet.
