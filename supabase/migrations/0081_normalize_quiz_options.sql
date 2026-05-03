-- =============================================================================
-- 0081_normalize_quiz_options.sql
--
-- Older quiz_questions rows were seeded with options as bare string arrays
-- (["foo", "bar"]) and `answer` as the literal label text. The student-side
-- QuizBlock expects [{id, label}] and submits opt.id, so legacy questions
-- rendered blank radio rows and would have scored as zero.
--
-- Mirrors 0078_normalize_poll_options.sql for the quiz table:
--   - options:     ["a","b"]                     → [{id:"0",label:"a"},{id:"1",label:"b"}]
--   - answer (single):  "a"                      → "0"   (id of the option whose label matches)
--   - answer (multi):   ["a","b"]                → ["0","1"]
--   - answer (short):   unchanged
--
-- Idempotent: only rewrites rows whose options array still contains a string
-- element. Already-normalized rows (objects) are left alone.
-- =============================================================================

begin;

update public.quiz_questions q
   set options = norm.new_options,
       answer  = norm.new_answer
  from (
    select
      qq.quiz_id, qq.ordinal,
      (select jsonb_agg(jsonb_build_object('id', (idx-1)::text, 'label', elem #>> '{}') order by idx)
         from jsonb_array_elements(qq.options) with ordinality as t(elem, idx)) as new_options,
      case
        when qq.kind = 'single' then to_jsonb((
          select (idx-1)::text
            from jsonb_array_elements(qq.options) with ordinality as t(elem, idx)
           where elem #>> '{}' = qq.answer #>> '{}'
           limit 1))
        when qq.kind = 'multi' then (
          select jsonb_agg((idx-1)::text)
            from jsonb_array_elements(qq.options) with ordinality as t(elem, idx)
           where elem #>> '{}' in (
             select a #>> '{}' from jsonb_array_elements(qq.answer) a))
        else qq.answer
      end as new_answer
    from public.quiz_questions qq
    where exists (
      select 1 from jsonb_array_elements(qq.options) e
      where jsonb_typeof(e) = 'string'
    )
  ) norm
 where q.quiz_id = norm.quiz_id and q.ordinal = norm.ordinal;

commit;
