update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Agent loops forever calling web_search. Best first fix?","type":"single","options":[{"text":"Cap steps, add a verification tool, or tighten stop conditions — address infinite retry.","correct":true},{"text":"Increase max tokens only.","correct":false},{"text":"Remove tool schemas.","correct":false},{"text":"Switch to single-shot only forever.","correct":false}],"explanation":"One of Day 23's five break-modes: infinite retry."},
  {"q":"Look back (Day 22): llms.txt purpose:","type":"single","options":[{"text":"Machine-readable site summary for AI crawlers / assistants.","correct":true},{"text":"Secret API key storage.","correct":false},{"text":"Docker compose file.","correct":false},{"text":"Rate-limit log.","correct":false}],"explanation":"GEO + deploy literacy before multi-agent."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 23
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s23$Scenario: Agent loops forever calling web_search. Best first fix?$s23$
  );
