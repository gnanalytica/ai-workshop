-- =============================================================================
-- 0077_polls_vote_count_denorm.sql
--
-- Denormalize poll_votes count onto polls.vote_count. Replaces the per-row
-- correlated `poll_votes(count)` subquery in web/lib/queries/polls.ts. With
-- a list of N polls the planner expands to N aggregations — at workshop
-- scale that's the difference between O(P) and O(P*V).
--
-- Maintained by trigger on poll_votes; resilient to the upsert path used
-- by castVote (UPDATE that doesn't change poll_id is a no-op).
-- =============================================================================

begin;

alter table polls add column if not exists vote_count int not null default 0;

-- One-time backfill so existing polls have correct counts.
update polls p
   set vote_count = sub.c
  from (
    select poll_id, count(*)::int as c
      from poll_votes
     group by poll_id
  ) sub
 where sub.poll_id = p.id;

create or replace function public._poll_votes_count_trg()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update polls set vote_count = vote_count + 1 where id = NEW.poll_id;
  elsif (TG_OP = 'DELETE') then
    update polls set vote_count = greatest(vote_count - 1, 0) where id = OLD.poll_id;
  elsif (TG_OP = 'UPDATE' and OLD.poll_id is distinct from NEW.poll_id) then
    update polls set vote_count = greatest(vote_count - 1, 0) where id = OLD.poll_id;
    update polls set vote_count = vote_count + 1 where id = NEW.poll_id;
  end if;
  return null;
end
$$;

drop trigger if exists trg_poll_votes_count on poll_votes;
create trigger trg_poll_votes_count
after insert or update or delete on poll_votes
for each row execute function public._poll_votes_count_trg();

commit;
