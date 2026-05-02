-- =============================================================================
-- 0070_quizzes_v2_timer_results.sql
--
-- Mirrors 0068 (polls v2) for quizzes: adds an optional live-session
-- deadline + per-cohort live-quiz lookup + per-question option breakdown.
--
-- Quizzes are also persistent (a student opens the day's lesson and answers
-- whenever); the new closes_at field is OPTIONAL and powers the popup +
-- live-session experience. When closes_at is null the quiz behaves exactly
-- as before. No closed_at column is needed — `now() > closes_at` is the
-- "no longer live" state, and the cap to take the quiz already comes from
-- the existing q_read / qa_self RLS.
-- =============================================================================

begin;

-- ----- 1. closes_at column ---------------------------------------------------
alter table quizzes add column if not exists closes_at timestamptz;

create index if not exists quizzes_cohort_active_idx
  on quizzes (cohort_id, closes_at)
  where closes_at is not null;

-- ----- 2. rpc_active_quiz(cohort) -- single most-recent live quiz ------------
-- Returns at most one row — the freshest quiz for the cohort whose live
-- window is open AND the caller hasn't completed yet. Used by the
-- student-facing popup poller. Mirrors rpc_active_poll's shape.
drop function if exists public.rpc_active_quiz(uuid);
create function public.rpc_active_quiz(p_cohort uuid)
returns table (
  id           uuid,
  title        text,
  day_number   int,
  closes_at    timestamptz,
  question_count int,
  attempted    boolean
)
language sql stable security definer
set search_path = public, auth
as $$
  select
    q.id,
    q.title,
    q.day_number,
    q.closes_at,
    (select count(*)::int from quiz_questions qq where qq.quiz_id = q.id) as question_count,
    exists (
      select 1 from quiz_attempts qa
       where qa.quiz_id = q.id
         and qa.user_id = auth.uid()
         and qa.completed_at is not null
    ) as attempted
  from quizzes q
  where q.cohort_id = p_cohort
    and q.closes_at is not null
    and q.closes_at > now()
    and (
      is_enrolled_in(p_cohort)
      or has_cap('content.read', p_cohort)
    )
  order by q.closes_at desc
  limit 1
$$;

grant execute on function public.rpc_active_quiz(uuid) to authenticated;

-- ----- 3. rpc_quiz_results(quiz) -- per-question option counts ---------------
-- Returns one row per (question_ordinal, option_id) with the option label
-- and the count of answers that picked it. For 'short' questions there are
-- no options, so we instead emit one row with choice='__short__' and
-- count = number of distinct non-empty answers. Caller must have content
-- read on the parent cohort.
drop function if exists public.rpc_quiz_results(uuid);
create function public.rpc_quiz_results(p_quiz uuid)
returns table (
  ordinal     int,
  prompt      text,
  kind        text,
  choice      text,
  label       text,
  votes       bigint
)
language plpgsql stable security definer
set search_path = public, auth
as $$
declare
  v_cohort uuid;
begin
  select cohort_id into v_cohort from quizzes where id = p_quiz;
  if v_cohort is null then
    return;
  end if;
  if not has_cap('content.read', v_cohort) then
    return;
  end if;

  return query
  with q as (
    select qq.ordinal, qq.prompt, qq.kind::text as kind, qq.options
      from quiz_questions qq
     where qq.quiz_id = p_quiz
  ),
  -- For choice questions, expand each option once.
  opts as (
    select
      q.ordinal, q.prompt, q.kind,
      coalesce(o->>'id', o->>'value', o::text) as choice,
      coalesce(o->>'label', o->>'text', o::text) as label
    from q,
         lateral jsonb_array_elements(case
                   when q.kind in ('single','multi') then q.options
                   else '[]'::jsonb
                 end) o
  ),
  -- Tally choice answers from completed attempts.
  picks as (
    select
      qq.ordinal,
      qq.kind::text as kind,
      case
        when qq.kind = 'multi' then jsonb_array_elements_text(coalesce(qa.answers->qq.ordinal::text, '[]'::jsonb))
        else qa.answers->>(qq.ordinal::text)
      end as choice
    from quiz_attempts qa
    join quiz_questions qq on qq.quiz_id = qa.quiz_id
    where qa.quiz_id = p_quiz
      and qa.completed_at is not null
  ),
  tally as (
    select ordinal, choice, count(*)::bigint as votes
      from picks
     where choice is not null and choice <> ''
     group by ordinal, choice
  ),
  -- For short answers we just count non-empty submissions.
  short_counts as (
    select qq.ordinal, count(*)::bigint as votes
      from quiz_attempts qa
      join quiz_questions qq on qq.quiz_id = qa.quiz_id
     where qa.quiz_id = p_quiz
       and qa.completed_at is not null
       and qq.kind = 'short'
       and coalesce(qa.answers->>(qq.ordinal::text), '') <> ''
     group by qq.ordinal
  )
  select o.ordinal, o.prompt, o.kind, o.choice, o.label, coalesce(t.votes, 0)::bigint
    from opts o
    left join tally t on t.ordinal = o.ordinal and t.choice = o.choice
  union all
  select q.ordinal, q.prompt, q.kind, '__short__'::text, '(short answer)'::text,
         coalesce(s.votes, 0)::bigint
    from q
    left join short_counts s on s.ordinal = q.ordinal
   where q.kind = 'short'
   order by ordinal, choice;
end
$$;

grant execute on function public.rpc_quiz_results(uuid) to authenticated;

commit;
