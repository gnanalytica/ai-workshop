-- 0107_quiz_scoring_set_based.sql
--
-- Rewrite rpc_submit_quiz_attempt() to score in a single set-based query
-- instead of a per-question PL/pgSQL loop. pg_stat_statements showed the
-- old version at mean 67ms and max 6.4s under concurrency during class —
-- the loop body re-issues subqueries for every quiz_questions row.
--
-- Scoring rules unchanged:
--   single: jsonb equality
--   multi:  set-equal on jsonb_array_elements_text (order-independent)
--   short:  lowercased, trimmed text equality
--
-- Semantics unchanged: returns the percent score, upserts quiz_attempts.

create or replace function rpc_submit_quiz_attempt(
  p_quiz uuid,
  p_answers jsonb
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total int := 0;
  v_correct int := 0;
  v_score numeric;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  with scored as (
    select
      q.ordinal,
      q.kind,
      q.answer,
      p_answers -> q.ordinal::text as given,
      case
        when (p_answers -> q.ordinal::text) is null then false
        when q.kind = 'single'
          then (p_answers -> q.ordinal::text) = q.answer
        when q.kind = 'multi'
          and jsonb_typeof(p_answers -> q.ordinal::text) = 'array'
          and jsonb_typeof(q.answer) = 'array'
          then (
            select coalesce(array_agg(e order by e), '{}')
            from jsonb_array_elements_text(p_answers -> q.ordinal::text) e
          ) = (
            select coalesce(array_agg(e order by e), '{}')
            from jsonb_array_elements_text(q.answer) e
          )
        when q.kind = 'short'
          then lower(trim(coalesce((p_answers -> q.ordinal::text) #>> '{}', '')))
             = lower(trim(coalesce(q.answer #>> '{}', '')))
        else false
      end as is_correct
    from quiz_questions q
    where q.quiz_id = p_quiz
  )
  select count(*), count(*) filter (where is_correct)
    into v_total, v_correct
    from scored;

  v_score := case when v_total = 0 then 0 else round(100.0 * v_correct / v_total, 2) end;

  insert into quiz_attempts (quiz_id, user_id, score, answers, completed_at)
  values (p_quiz, v_user, v_score, p_answers, now())
  on conflict (quiz_id, user_id) do update
    set score = excluded.score,
        answers = excluded.answers,
        completed_at = excluded.completed_at;

  return v_score;
end;
$$;

revoke all on function rpc_submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function rpc_submit_quiz_attempt(uuid, jsonb) to authenticated;
