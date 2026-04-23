update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Leaderboard model crushes MMLU but fails your five real capstone prompts. What do you trust?","type":"single","options":[{"text":"Your private eval — generic benchmarks miss your task mix.","correct":true},{"text":"MMLU only.","correct":false},{"text":"Whichever model is newest.","correct":false},{"text":"Parameter count alone.","correct":false}],"explanation":"Day 27: contamination + task mismatch make headlines dangerous."},
  {"q":"Look back (Day 26): The five safety patterns include:","type":"single","options":[{"text":"Stop button, citations, rate-limit, I/O filter, opt-out.","correct":true},{"text":"Logo, colour, font, hero, footer.","correct":false},{"text":"TCP, UDP, TLS, SSH, VPN.","correct":false},{"text":"SFT, RLHF, DPO, RAG, MCP.","correct":false}],"explanation":"Safety stack before model cards."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 27
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s27$Scenario: Leaderboard model crushes MMLU but fails your five real capstone prompts. What do you trust?$s27$
  );
