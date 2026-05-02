-- Composite FK indexes for polls.cohort_id_day_number_fkey and
-- quizzes.cohort_id_day_number_fkey, flagged by Supabase performance advisor.
-- Both have a composite FK on (cohort_id, day_number) without a covering
-- index — at scale this means seq-scans on cohort_days cascades.
--
-- Tables are tiny today (5 polls, 3 quizzes), so the impact is microseconds,
-- but cheap insurance for the workshop and silences the advisor.

create index if not exists polls_cohort_day_idx
  on public.polls (cohort_id, day_number);

create index if not exists quizzes_cohort_day_idx
  on public.quizzes (cohort_id, day_number);
