update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Your CLD has arrows all pointing from cause → symptom but no arrow back — what is wrong?","type":"single","options":[{"text":"You drew a tree, not a feedback loop — add how the symptom reinforces the cause.","correct":true},{"text":"You need more colours.","correct":false},{"text":"CLDs cannot include delays.","correct":false},{"text":"Polarity signs are optional decoration.","correct":false}],"explanation":"Systems thinking needs at least one closed loop for stuck problems."},
  {"q":"Look back (Day 13): Mom-Test compliant question:","type":"single","options":[{"text":"What did you do the last time this problem happened?","correct":true},{"text":"Would you pay ₹500 for my app?","correct":false},{"text":"Do you think this is a billion-dollar idea?","correct":false},{"text":"Would strangers love this?","correct":false}],"explanation":"Past behaviour beats hypothetical futures."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 14
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s14$Scenario: Your CLD has arrows all pointing from cause → symptom but no arrow back — what is wrong?$s14$
  );
