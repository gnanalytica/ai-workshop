update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Answers are fluent but cite wrong chunks — first knob to turn?","type":"single","options":[{"text":"Chunk size / overlap / top-K / embedding model — retrieval before blaming generation.","correct":true},{"text":"Switch to a 400B model immediately.","correct":false},{"text":"Delete the vector DB.","correct":false},{"text":"Raise temperature to 2.0.","correct":false}],"explanation":"Bad RAG is usually retrieval geometry, not IQ."},
  {"q":"Look back (Day 17): Quantization mainly:","type":"single","options":[{"text":"Compresses weights so models fit consumer hardware.","correct":true},{"text":"Counts tokens in Hindi.","correct":false},{"text":"Replaces eval sheets.","correct":false},{"text":"Fixes prompt injection.","correct":false}],"explanation":"Local + cloud model literacy loop."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 18
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s18$Scenario: Answers are fluent but cite wrong chunks — first knob to turn?$s18$
  );
