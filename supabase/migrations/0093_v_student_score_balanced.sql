-- Rebalanced leaderboard scoring
--   total_score (0-100) = 0.35*quiz + 0.35*submission + 0.30*activity
--   - quiz_score:       avg over EVERY published quiz in cohort, missing = 0
--   - submission_score: avg over every weight>0 non-reflection assignment in
--                       cohort, using coalesce(score, ai_score, 0) per submission
--   - activity_score:   distinct unlocked days where the student touched any
--                       signal / unlocked_days * 100
-- Defined for confirmed students only.

drop view if exists public.v_pod_score_summary cascade;
drop view if exists public.v_student_score cascade;

create view public.v_student_score
with (security_invoker = on)
as
with confirmed as (
  select cohort_id, user_id
  from public.registrations
  where status = 'confirmed'
),
cohort_quizzes as (
  select cohort_id, id as quiz_id
  from public.quizzes
  where is_published = true
),
quiz_per_user as (
  select c.cohort_id, c.user_id,
         coalesce(avg(coalesce(qa.score, 0)), 0)::numeric as score
  from confirmed c
  left join cohort_quizzes cq on cq.cohort_id = c.cohort_id
  left join public.quiz_attempts qa
    on qa.quiz_id = cq.quiz_id and qa.user_id = c.user_id
  group by c.cohort_id, c.user_id
),
cohort_assignments as (
  select cohort_id, id as assignment_id
  from public.assignments
  where coalesce(weight, 1) > 0
    and kind <> 'reflection'
),
sub_per_user as (
  select c.cohort_id, c.user_id,
         coalesce(avg(coalesce(s.score, s.ai_score, 0)), 0)::numeric as score
  from confirmed c
  left join cohort_assignments ca on ca.cohort_id = c.cohort_id
  left join public.submissions s
    on s.assignment_id = ca.assignment_id and s.user_id = c.user_id
  group by c.cohort_id, c.user_id
),
unlocked as (
  select cohort_id, day_number
  from public.cohort_days
  where is_unlocked = true
),
unlocked_count as (
  select cohort_id, count(*)::int as n
  from unlocked
  group by cohort_id
),
active_day_per_user as (
  select distinct c.cohort_id, c.user_id, u.day_number
  from confirmed c
  join unlocked u on u.cohort_id = c.cohort_id
  where exists (
    select 1 from public.submissions s
      join public.assignments a on a.id = s.assignment_id
     where s.user_id = c.user_id
       and a.cohort_id = c.cohort_id
       and a.day_number = u.day_number
  )
  or exists (
    select 1 from public.quiz_attempts qa
      join public.quizzes q on q.id = qa.quiz_id
     where qa.user_id = c.user_id
       and q.cohort_id = c.cohort_id
       and q.day_number = u.day_number
  )
  or exists (
    select 1 from public.day_feedback df
     where df.user_id = c.user_id
       and df.cohort_id = c.cohort_id
       and df.day_number = u.day_number
  )
  or exists (
    select 1 from public.poll_votes pv
      join public.polls p on p.id = pv.poll_id
     where pv.user_id = c.user_id
       and p.cohort_id = c.cohort_id
       and p.day_number = u.day_number
  )
  or exists (
    select 1 from public.lab_progress lp
     where lp.user_id = c.user_id
       and lp.cohort_id = c.cohort_id
       and lp.day_number = u.day_number
  )
),
active_count_per_user as (
  select cohort_id, user_id, count(*)::int as n
  from active_day_per_user
  group by cohort_id, user_id
),
activity_per_user as (
  select c.cohort_id, c.user_id,
         case when coalesce(uc.n, 0) > 0
              then (coalesce(adc.n, 0) * 100.0 / uc.n)::numeric
              else 0::numeric end as score
  from confirmed c
  left join unlocked_count uc on uc.cohort_id = c.cohort_id
  left join active_count_per_user adc
         on adc.cohort_id = c.cohort_id and adc.user_id = c.user_id
)
select
  c.cohort_id,
  c.user_id,
  round(coalesce(q.score, 0), 2)::numeric as quiz_score,
  round(coalesce(s.score, 0), 2)::numeric as submission_score,
  round(coalesce(a.score, 0), 2)::numeric as activity_score,
  round(
    0.35 * coalesce(q.score, 0)
  + 0.35 * coalesce(s.score, 0)
  + 0.30 * coalesce(a.score, 0)
  , 2)::numeric as total_score
from confirmed c
left join quiz_per_user      q on q.cohort_id = c.cohort_id and q.user_id = c.user_id
left join sub_per_user       s on s.cohort_id = c.cohort_id and s.user_id = c.user_id
left join activity_per_user  a on a.cohort_id = c.cohort_id and a.user_id = c.user_id;

grant select on public.v_student_score to authenticated;

-- Recreate the pod summary view that depends on v_student_score
create view public.v_pod_score_summary
with (security_invoker = on)
as
select
  pm.cohort_id,
  p.id   as pod_id,
  p.name as pod_name,
  count(distinct pm.student_user_id)::int as member_count,
  coalesce(sum(s.total_score), 0)::numeric as total_score,
  case when count(distinct pm.student_user_id) > 0
       then round(coalesce(sum(s.total_score), 0) / count(distinct pm.student_user_id), 2)
       else 0 end as avg_score
from public.pod_members pm
join public.pods p on p.id = pm.pod_id
left join public.v_student_score s
       on s.cohort_id = pm.cohort_id
      and s.user_id   = pm.student_user_id
group by pm.cohort_id, p.id, p.name;

grant select on public.v_pod_score_summary to authenticated;
