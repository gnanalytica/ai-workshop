-- Auto-set polls.day_number from cohort_days.live_session_at when a poll is
-- created/updated without one. Anchored to opened_at (or created_at) in IST.
-- Quiet no-op when the cohort has no matching live_session_at for that date.

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

  anchor_ts := coalesce(NEW.opened_at, NEW.created_at, now());

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

drop trigger if exists tr_set_poll_day_from_session_date on public.polls;

create trigger tr_set_poll_day_from_session_date
before insert or update of opened_at, day_number on public.polls
for each row
when (NEW.day_number is null)
execute function public.set_poll_day_from_session_date();
