-- Demo: shift Cohort 01 to start May 1, 2026 on weekdays only (M–F).
-- Applied 2026-04-24 via MCP. 30 sessions span Fri 2026-05-01 through Thu
-- 2026-06-11. Each day's live_session_at is 10:00 Asia/Kolkata so
-- admin-schedule's "unlock through today" logic follows the explicit
-- weekday calendar (not naive calendar-day diff from starts_on).

with weekdays as (
  select d::date as session_date,
         row_number() over (order by d) as day_number
  from generate_series('2026-05-01'::date, '2026-06-30'::date, interval '1 day') d
  where extract(isodow from d) < 6
  limit 30
)
update public.cohort_days cd
set live_session_at = (w.session_date + time '10:00') at time zone 'Asia/Kolkata'
from weekdays w
where cd.cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e'
  and cd.day_number = w.day_number;

update public.cohorts
set starts_on = '2026-05-01', ends_on = '2026-06-11'
where id = '56268633-9e93-4305-af6a-1b622a833d8e';
