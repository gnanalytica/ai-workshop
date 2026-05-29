-- 0110_day16_vibe_coding_assignment_and_quiz.sql
--
-- Day 16 of the KBN Internship · May 2026 cohort was reframed from the
-- earlier "Git / GitHub / localhost / APIs" rails to **Vibe Coding (incl.
-- Plan mode)** (see web/content/day-16.mdx).
--
-- This migration brings the database-backed assignment + quiz in line with
-- the new framing:
--
--   1. Inserts a new lab assignment "Vibe-coded portfolio" on day 16 with
--      a body_md that asks students to submit EITHER a public image link of
--      their portfolio OR the Google AI Studio share link. Idempotent via
--      NOT EXISTS on (cohort_id, day_number, title).
--
--   2. Ensures a Day 16 quiz row exists for the cohort, updates its title
--      to "Day 16: Vibe Coding fundamentals", bumps version, deletes any
--      existing questions, and inserts the 5 new vibe-coding questions.
--
-- Quiz `options` follow the normalized [{id, label}] shape (see 0081);
-- `answer` for kind=single is the option id ("0".."3"). Correct answers
-- live ONLY in quiz_questions.answer — the student-side QuizBlock renders
-- only prompt + options.label, so answers are never exposed pre-attempt.
--
-- Scoped to cohort 56268633-9e93-4305-af6a-1b622a833d8e
-- (slug: kbn-internship-2026-05).

begin;

-- 1. -------------------------------------------------------------------------
--    Assignment: "Vibe-coded portfolio"
-- ---------------------------------------------------------------------------
insert into assignments (cohort_id, day_number, kind, title, body_md)
select c.id, 16, 'lab'::assignment_kind,
       'Vibe-coded portfolio',
       $md$Use a vibe-coding tool (Google AI Studio, Bolt, Emergent, Lovable, or Antigravity) to build a **single-page personal portfolio**. It should include: a one-line bio, 2–3 projects, a contact section, and at least one styling choice you actively edited (colour, font, layout).

**Use Plan mode first.** Write a 4-step plan, edit it, then let the tool generate.

**Submit one of the following:**

1. **An image of your portfolio** — take a full-page screenshot, upload it to Google Drive / Imgur / GitHub (set to *anyone with the link*), and paste the public image URL in the Links field below (label: `Portfolio screenshot`).
2. **A Google AI Studio share link with preview** — in AI Studio click **Share** → *anyone with the link*, copy the URL, paste it in the Links field below (label: `AI Studio preview`).

Either one counts as a valid submission. You may submit both.

**Also write 60–120 words in the text box:**
- Which tool you picked and why.
- One thing vibe coding nailed on the first try.
- One thing it got wrong, and how you corrected it (re-prompt? hand-edit? switched tools?).$md$
from cohorts c
where c.slug = 'kbn-internship-2026-05'
  and not exists (
    select 1 from assignments a
    where a.cohort_id = c.id
      and a.day_number = 16
      and a.title = 'Vibe-coded portfolio'
  );

-- 2. -------------------------------------------------------------------------
--    Quiz: ensure a row exists, retitle, bump version, replace questions.
-- ---------------------------------------------------------------------------

-- 2a. Insert the quiz row if one doesn't already exist for (cohort, day 16).
insert into quizzes (cohort_id, day_number, title, version, is_published)
select c.id, 16, 'Day 16: Vibe Coding fundamentals', 1, true
from cohorts c
where c.slug = 'kbn-internship-2026-05'
  and not exists (
    select 1 from quizzes q
    where q.cohort_id = c.id
      and q.day_number = 16
  );

-- 2b. Retitle + bump version on whichever Day 16 quiz exists for this cohort.
update quizzes q
   set title = 'Day 16: Vibe Coding fundamentals',
       version = q.version + 1
  from cohorts c
 where q.cohort_id = c.id
   and q.day_number = 16
   and c.slug = 'kbn-internship-2026-05';

-- 2c. Clear any existing questions on that quiz before inserting the new set.
delete from quiz_questions
 where quiz_id in (
   select q.id
     from quizzes q
     join cohorts c on c.id = q.cohort_id
    where q.day_number = 16
      and c.slug = 'kbn-internship-2026-05'
 );

-- 2d. Insert the 5 new vibe-coding questions.
with q as (
  select q.id
    from quizzes q
    join cohorts c on c.id = q.cohort_id
   where q.day_number = 16
     and c.slug = 'kbn-internship-2026-05'
)
insert into quiz_questions (quiz_id, ordinal, prompt, kind, options, answer)
select q.id, v.ordinal, v.prompt, v.kind::quiz_question_kind, v.options, v.answer
  from q,
       (values
         (1,
          'Concept Check — What is the core idea behind "Vibe Coding"?',
          'single',
          jsonb_build_array(
            jsonb_build_object('id','0','label','Writing code exclusively in Python using AI autocomplete'),
            jsonb_build_object('id','1','label','Using natural language prompts and AI assistance to write, debug, and deploy code instead of typing every line manually'),
            jsonb_build_object('id','2','label','A new programming language developed by Google that replaces JavaScript'),
            jsonb_build_object('id','3','label','Writing code while listening to music to improve focus and productivity')),
          to_jsonb('1'::text)),

         (2,
          'Tool Identification — You need to quickly prototype a code idea in your browser without installing any software. Which tool is the best fit?',
          'single',
          jsonb_build_array(
            jsonb_build_object('id','0','label','OpenCode — because it runs directly in the browser without installation'),
            jsonb_build_object('id','1','label','Lovable — because it is designed for quick browser-based prototyping without setup'),
            jsonb_build_object('id','2','label','Google AI Studio — because it is a free browser-based platform for experimenting with code'),
            jsonb_build_object('id','3','label','Antigravity IDE — because it requires no account or login to use')),
          to_jsonb('2'::text)),

         (3,
          'Practical Application — You run `npm install -g opencode-ai@latest` but get a permission error on Windows. According to the presentation, what should you try first?',
          'single',
          jsonb_build_array(
            jsonb_build_object('id','0','label','Reinstall Node.js using the 32-bit version instead of 64-bit'),
            jsonb_build_object('id','1','label','Run Terminal as Administrator or use `npm config set prefix` to set a custom global directory'),
            jsonb_build_object('id','2','label','Disable Windows Defender and turn off your firewall temporarily'),
            jsonb_build_object('id','3','label','Switch to macOS or Linux, as Windows does not support OpenCode')),
          to_jsonb('1'::text)),

         (4,
          'Security & Best Practices — Which of the following is NOT mentioned in the presentation as a best practice for vibe coding?',
          'single',
          jsonb_build_array(
            jsonb_build_object('id','0','label','Be specific with your prompts to get better generated code'),
            jsonb_build_object('id','1','label','Use Git version control and commit frequently'),
            jsonb_build_object('id','2','label','Always deploy AI-generated code directly to production without review'),
            jsonb_build_object('id','3','label','Combine different tools based on their strengths')),
          to_jsonb('2'::text)),

         (5,
          'Scenario-Based — You want to build a full-stack application with a visual editor and deploy it with one click. Which tool matches this need?',
          'single',
          jsonb_build_array(
            jsonb_build_object('id','0','label','OpenAI Codex — because it is a CLI tool with built-in visual editing'),
            jsonb_build_object('id','1','label','Google AI Studio — because it generates full-stack apps with one-click deployment'),
            jsonb_build_object('id','2','label','Lovable — because it turns natural language into full-stack apps with a visual editor and one-click deployment'),
            jsonb_build_object('id','3','label','NVIDIA Build — because it is an IDE specifically designed for full-stack web development')),
          to_jsonb('2'::text))
       ) as v(ordinal, prompt, kind, options, answer);

commit;
