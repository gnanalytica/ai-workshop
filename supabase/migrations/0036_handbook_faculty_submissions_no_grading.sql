-- Clarify: faculty do not grade; align copy with 0027_grading_redesign (staff/trainer grading).
update faculty_pretraining_modules
set
  body_md = replace(
    body_md,
    '- **Recent submissions** — What they turned in and status (submitted, graded, etc.).',
    '- **Recent submissions** — Recent hand-ins and how far along each is (e.g. submitted, returned). Scoring and release of marks are handled by program staff; you use this to coach and follow up, not to grade.'
  )
where slug = 'platform_faculty';
