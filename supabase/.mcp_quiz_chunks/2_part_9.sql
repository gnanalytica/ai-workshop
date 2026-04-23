update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: It is Day 29 evening and you want to add 'just one small feature' before demo. Best move?","type":"single","options":[{"text":"Polish and rehearse — resist scope adds per Day 29 rule.","correct":true},{"text":"Ship the feature untested.","correct":false},{"text":"Skip rehearsal — code is ready.","correct":false},{"text":"Change frameworks for fun.","correct":false}],"explanation":"Cohort lesson: demos die to last-minute features."},
  {"q":"Look back (Day 28): A 'firehose' source is:","type":"single","options":[{"text":"Unfiltered stream — powerful for hunts, dangerous as a daily habit.","correct":true},{"text":"A paid newsletter only.","correct":false},{"text":"Only podcasts.","correct":false},{"text":"Blocked in India.","correct":false}],"explanation":"Habits before dress rehearsal."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 29
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s29$Scenario: It is Day 29 evening and you want to add 'just one small feature' before demo. Best move?$s29$
  );
