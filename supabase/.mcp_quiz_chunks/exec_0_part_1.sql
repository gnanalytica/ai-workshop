update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: You need a verbatim date from an Act for an assignment. Same prompt at temperature 0 vs 1.2 — which is the safer default before human proofreading?","type":"single","options":[{"text":"Lower temperature for factual, extraction-style answers.","correct":true},{"text":"Higher temperature for all legal text.","correct":false},{"text":"Temperature never changes factual risk.","correct":false},{"text":"Use the highest temperature always.","correct":false}],"explanation":"Lower temperature reduces sampling variance; you still verify statutes manually."},
  {"q":"Look back (Day 1): What is hallucination in one line?","type":"single","options":[{"text":"The model states false or ungrounded claims with high confidence.","correct":true},{"text":"The model runs out of VRAM.","correct":false},{"text":"The tokenizer splits Hindi wrong.","correct":false},{"text":"The chat UI is slow.","correct":false}],"explanation":"Spaced recall from Day 1 before Week 2 research stack."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 2
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s2$Scenario: You need a verbatim date from an Act for an assignment. Same prompt at temperature 0 vs 1.2 — which is the safer default before human proofreading?$s2$;
