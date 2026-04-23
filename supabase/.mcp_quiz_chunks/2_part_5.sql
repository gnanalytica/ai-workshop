update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Panelist says 'I don't like the gradient' mid-demo. How do you label it?","type":"single","options":[{"text":"Taste — note and move on unless brand-critical.","correct":true},{"text":"Signal — must rebuild core flow.","correct":false},{"text":"Confused — they missed the product.","correct":false},{"text":"Ignore all feedback.","correct":false}],"explanation":"Taste vs signal vs confused drives different responses."},
  {"q":"Look back (Day 24): Supervisor pattern means:","type":"single","options":[{"text":"A boss agent delegates subtasks to worker agents.","correct":true},{"text":"Agents vote democratically with no lead.","correct":false},{"text":"Humans only, no models.","correct":false},{"text":"One agent with 200 tools.","correct":false}],"explanation":"Orchestration vocabulary before Week-6 polish."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 25
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s25$Scenario: Panelist says 'I don't like the gradient' mid-demo. How do you label it?$s25$
  );
