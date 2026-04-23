update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Your 'will build' list is longer than your NOT-list the night you lock spec. Instructor reaction?","type":"single","options":[{"text":"NOT-list too thin — cut scope until NOT is at least as concrete as WILL.","correct":true},{"text":"Ship everything — you can sleep in April.","correct":false},{"text":"Delete metrics — they slow you down.","correct":false},{"text":"Add mobile + auth + payments tonight.","correct":false}],"explanation":"Milestone 2 discipline: anti-scope is the gift to Week-3 you."},
  {"q":"Look back (Day 14): '+' on a causal link means:","type":"single","options":[{"text":"A and B move in the same direction (more A → more B).","correct":true},{"text":"The relationship is morally good.","correct":false},{"text":"Add two variables.","correct":false},{"text":"Positive feedback only in virtuous loops.","correct":false}],"explanation":"Polarity recall before build week."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 15
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s15$Scenario: Your 'will build' list is longer than your NOT-list the night you lock spec. Instructor reaction?$s15$
  );
