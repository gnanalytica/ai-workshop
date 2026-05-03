-- =============================================================================
-- 0082_lesson_section_progress.sql
--
-- Per-user, per-day, per-phase, per-section completion log so the student
-- lesson reader can show "Mark complete & continue" and persist progress.
--
-- Design notes:
--   - Composite PK doubles as the upsert idempotency key (mark twice = no-op).
--   - No update path: completion is one-way (we never "uncomplete" a section).
--     If we ever need that, add a soft-delete column rather than DELETE so the
--     audit trail is preserved.
--   - phase is a free text constrained by CHECK rather than an enum so adding
--     a new phase later doesn't require an enum migration dance.
-- =============================================================================

begin;

create table if not exists public.lesson_section_progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  cohort_id     uuid not null references public.cohorts(id) on delete cascade,
  day_number    int  not null check (day_number between 1 and 60),
  phase         text not null check (phase in ('pre','live','post','extra')),
  section_index int  not null check (section_index >= 0),
  completed_at  timestamptz not null default now(),
  primary key (user_id, cohort_id, day_number, phase, section_index)
);

create index if not exists lesson_section_progress_user_day_idx
  on public.lesson_section_progress (user_id, cohort_id, day_number);

alter table public.lesson_section_progress enable row level security;

drop policy if exists lsp_self_read on public.lesson_section_progress;
create policy lsp_self_read on public.lesson_section_progress
  for select using (user_id = (select auth.uid()));

drop policy if exists lsp_self_insert on public.lesson_section_progress;
create policy lsp_self_insert on public.lesson_section_progress
  for insert with check (
    user_id = (select auth.uid())
    and is_enrolled_in(cohort_id)
  );

commit;
