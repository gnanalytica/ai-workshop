-- Day 13 ships a second assignment ("Academic topic deck") alongside the
-- existing Capstone deck. LessonDayView renders an AssignmentBlock (submit
-- form + link field) for every row in `assignments`, so this insert gives
-- the new section a place where students paste their public deck URL.
--
-- Scoped to the KBN Internship cohort only. Idempotent via NOT EXISTS on
-- (cohort_id, day_number, title).

insert into assignments (cohort_id, day_number, kind, title, body_md)
select c.id, 13, 'lab'::assignment_kind,
       'Academic topic deck',
       $md$8-slide AI-generated presentation on any topic from your last-year academic curriculum.

**Required slides.** Title · Introduction · Key Concepts · Real-world Applications · Summary · Thank You.

**Tools.** Gamma, Canva AI, Prezi AI, or Google Gemini.

**Submit.** Paste the public deck link in the Links field below (set the deck to *anyone with link*) and add a short note on which tool you used and why.$md$
from cohorts c
where c.slug = 'kbn-internship-2026-05'
  and not exists (
    select 1 from assignments a
    where a.cohort_id = c.id
      and a.day_number = 13
      and a.title = 'Academic topic deck'
  );
