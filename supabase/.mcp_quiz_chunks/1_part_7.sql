update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Variant A wins 7/10 on your eval; Variant B wins 3/10 but feels nicer to read. Which ships first?","type":"single","options":[{"text":"Variant A — let metrics break the tie unless stakes are purely subjective.","correct":true},{"text":"Variant B — vibes beat scores.","correct":false},{"text":"Average the prompts.","correct":false},{"text":"Delete the eval sheet.","correct":false}],"explanation":"Evals exist to stop aesthetic self-deception on functional tasks."},
  {"q":"Look back (Day 16): Fork vs branch in one line:","type":"single","options":[{"text":"Fork copies someone else's repo to your account; branch is a parallel line of work inside one repo.","correct":true},{"text":"Branch is only for databases.","correct":false},{"text":"Fork is always private.","correct":false},{"text":"They are synonyms.","correct":false}],"explanation":"Git vocabulary before RAG + agents."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 17
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s17$Scenario: Variant A wins 7/10 on your eval; Variant B wins 3/10 but feels nicer to read. Which ships first?$s17$
  );
