update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: CLAUDE.md says 'never add dependencies' but the model keeps adding packages. Best next fix?","type":"single","options":[{"text":"Make the rule testable: 'If adding a dep, stop and ask' + point to existing stack list.","correct":true},{"text":"Delete CLAUDE.md — it clearly fails.","correct":false},{"text":"Yell 'please follow rules' each message.","correct":false},{"text":"Switch models without editing the file.","correct":false}],"explanation":"Vague rules train nothing; testable rules + architecture map win."},
  {"q":"Look back (Day 18): RAG in one line:","type":"single","options":[{"text":"Retrieve relevant chunks from your data, then generate with them in context.","correct":true},{"text":"Random access GPU memory.","correct":false},{"text":"Fine-tune on every query.","correct":false},{"text":"Replace Postgres with CSV.","correct":false}],"explanation":"Lock retrieval story before automation week."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 19
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s19$Scenario: CLAUDE.md says 'never add dependencies' but the model keeps adding packages. Best next fix?$s19$
  );
