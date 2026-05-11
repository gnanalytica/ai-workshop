-- 0098_fix_poll_day_trigger_no_created_at.sql
--
-- 0095 introduced set_poll_day_from_session_date() which inferred day_number
-- from coalesce(NEW.opened_at, NEW.created_at, now()). Problem: polls has
-- no `created_at` column, so every poll INSERT raised
--   record "new" has no field "created_at"
-- and the insert blew up. Drafts (opened_at NULL) and any newly-created
-- poll both failed.
--
-- Fix: anchor on coalesce(NEW.opened_at, now()) — drop the bad column ref.
-- Trigger purpose unchanged.
-- =============================================================================

create or replace function public.set_poll_day_from_session_date()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  anchor_ts timestamptz;
  inferred int;
begin
  if NEW.day_number is not null then return NEW; end if;

  anchor_ts := coalesce(NEW.opened_at, now());

  select cd.day_number into inferred
  from public.cohort_days cd
  where cd.cohort_id = NEW.cohort_id
    and cd.live_session_at is not null
    and (cd.live_session_at at time zone 'Asia/Kolkata')::date
        = (anchor_ts at time zone 'Asia/Kolkata')::date
  limit 1;

  if inferred is not null then
    NEW.day_number := inferred;
  end if;
  return NEW;
end
$$;
