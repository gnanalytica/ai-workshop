update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: A relative says ten citations from ChatGPT mean the answer must be true. Best response?","type":"single","options":[{"text":"Still verify each claim against the source — citations can misstate or drift.","correct":true},{"text":"Ten links guarantee accuracy.","correct":false},{"text":"Only trust answers without links.","correct":false},{"text":"AI never cites sources.","correct":false}],"explanation":"Grounding reduces risk; it does not remove the Day-1 lesson that models can be confidently wrong."},
  {"q":"Forward link: Why is the Day-1 reflection written with zero AI assistance?","type":"single","options":[{"text":"To preserve an honest Day-0 baseline for the Day-30 arc.","correct":true},{"text":"Because models cannot write.","correct":false},{"text":"It is optional for busy students.","correct":false},{"text":"To comply with tokenizer limits.","correct":false}],"explanation":"You are measuring growth; a synthetic Day-1 essay breaks the story."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 1
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s1$Scenario: A relative says ten citations from ChatGPT mean the answer must be true. Best response?$s1$;
