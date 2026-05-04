-- =============================================================================
-- 0089_fix_rpc_quiz_results_variable_conflict.sql
--
-- Fix `rpc_quiz_results(uuid)`: bare references to `choice` and `ordinal`
-- inside the `picks`, `tally`, and final `order by` clauses collide with the
-- function's OUT parameters of the same name. PL/pgSQL's default policy is
-- `variable_conflict error`, so the call fails at runtime with:
--   ERROR: column reference "choice" is ambiguous
-- Add `#variable_conflict use_column` so PL/pgSQL resolves these names as
-- columns. Body is otherwise identical to 0087.
-- =============================================================================

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
#variable_conflict use_column
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
  picks as (
    select qq.ordinal, qq.kind::text as kind, choice
      from quiz_attempts qa
      join quiz_questions qq on qq.quiz_id = qa.quiz_id,
           lateral jsonb_array_elements_text(
             coalesce(qa.answers->qq.ordinal::text, '[]'::jsonb)
           ) as choice
     where qa.quiz_id = p_quiz
       and qa.completed_at is not null
       and qq.kind = 'multi'
    union all
    select qq.ordinal, qq.kind::text as kind,
           qa.answers->>(qq.ordinal::text) as choice
      from quiz_attempts qa
      join quiz_questions qq on qq.quiz_id = qa.quiz_id
     where qa.quiz_id = p_quiz
       and qa.completed_at is not null
       and qq.kind = 'single'
  ),
  tally as (
    select ordinal, choice, count(*)::bigint as votes
      from picks
     where choice is not null and choice <> ''
     group by ordinal, choice
  ),
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
