update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Live demo hangs on a cold API. What should you have ready per Day 29–30 guidance?","type":"single","options":[{"text":"Pre-recorded backup clip or Loom on a second tab — switch gracefully.","correct":true},{"text":"Restart the panel's laptops.","correct":false},{"text":"Read the README aloud for 4 minutes.","correct":false},{"text":"Skip the ask.","correct":false}],"explanation":"Grace under failure is scored; backups are professional."},
  {"q":"Look back (Day 1): What is the core honest description of an LLM from Week 1?","type":"single","options":[{"text":"A stateless pattern machine — not conscious, not inherently truthful.","correct":true},{"text":"A conscious digital being.","correct":false},{"text":"A guaranteed search engine.","correct":false},{"text":"A database of facts only.","correct":false}],"explanation":"Full-circle recall from Day-0 baseline to shipped capstone."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 30
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s30$Scenario: Live demo hangs on a cold API. What should you have ready per Day 29–30 guidance?$s30$
  );
