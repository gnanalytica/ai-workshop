-- Auto-publish all quizzes for a cohort+day when the day flips into unlocked.
-- Fires only on the false -> true transition of cohort_days.is_unlocked.
-- Idempotent: bounded by is_published = false.

create or replace function public.publish_quizzes_on_day_unlock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.quizzes
     set is_published = true
   where cohort_id  = NEW.cohort_id
     and day_number = NEW.day_number
     and is_published = false;
  return NEW;
end
$$;

drop trigger if exists tr_publish_quizzes_on_day_unlock on public.cohort_days;

create trigger tr_publish_quizzes_on_day_unlock
after update of is_unlocked on public.cohort_days
for each row
when (NEW.is_unlocked is true and OLD.is_unlocked is distinct from true)
execute function public.publish_quizzes_on_day_unlock();
