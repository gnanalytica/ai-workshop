-- Quiz scoring RPC. Server-side authoritative because RLS hides
-- quiz_questions.answer from non-staff readers.

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
  q record;
  v_given jsonb;
  v_score numeric;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  for q in
    select ordinal, kind, answer
    from quiz_questions
    where quiz_id = p_quiz
    order by ordinal
  loop
    v_total := v_total + 1;
    v_given := p_answers -> q.ordinal::text;
    if v_given is null then
      continue;
    end if;
    if q.kind = 'single' then
      if v_given = q.answer then
        v_correct := v_correct + 1;
      end if;
    elsif q.kind = 'multi' then
      if jsonb_typeof(v_given) = 'array' and jsonb_typeof(q.answer) = 'array'
         and (
           select coalesce(array_agg(elem order by elem), '{}')
           from jsonb_array_elements_text(v_given) as elem
         ) = (
           select coalesce(array_agg(elem order by elem), '{}')
           from jsonb_array_elements_text(q.answer) as elem
         )
      then
        v_correct := v_correct + 1;
      end if;
    elsif q.kind = 'short' then
      if lower(trim(coalesce(v_given #>> '{}', ''))) =
         lower(trim(coalesce(q.answer #>> '{}', '')))
      then
        v_correct := v_correct + 1;
      end if;
    end if;
  end loop;

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
