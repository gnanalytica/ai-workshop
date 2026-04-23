update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: You follow 40 AI Substacks and read none. Day 28 fix?","type":"single","options":[{"text":"Curate five sources + calendar-lock a weekly slot — cap time, not ambition.","correct":true},{"text":"Subscribe to more feeds.","correct":false},{"text":"Only use WhatsApp forwards.","correct":false},{"text":"Read every paper fully daily.","correct":false}],"explanation":"Pipeline beats firehose; Friday slot is the commitment device."},
  {"q":"Look back (Day 27): Benchmark contamination means:","type":"single","options":[{"text":"Test items leaked into training so leaderboard scores inflate.","correct":true},{"text":"GPUs overheated during eval.","correct":false},{"text":"Users contaminated the UI.","correct":false},{"text":"Models cannot take benchmarks.","correct":false}],"explanation":"Literacy for signal pipeline choices."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 28
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s28$Scenario: You follow 40 AI Substacks and read none. Day 28 fix?$s28$
  );
