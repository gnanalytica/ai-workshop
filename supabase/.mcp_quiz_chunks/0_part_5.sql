update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: You paste a 40-page PDF class policy into a blank chat vs into a Project with that file pinned. Which is more likely to give grounded, on-policy answers?","type":"single","options":[{"text":"Project with the file in workspace / system context.","correct":true},{"text":"Blank chat with the same paste every time.","correct":false},{"text":"Neither — models cannot read PDFs.","correct":false},{"text":"Only the model brand matters.","correct":false}],"explanation":"Context beats a one-off paste; Projects bundle files + instructions."},
  {"q":"Look back (Day 5): Personal AI Stack v1 includes which section pairing?","type":"single","options":[{"text":"My AI Tools + My Next Bet among the four blocks.","correct":true},{"text":"Capstone repo + CI only.","correct":false},{"text":"GPU specs + cloud bill only.","correct":false},{"text":"Only LinkedIn prompts.","correct":false}],"explanation":"Spaced recall from milestone day before research stack."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 6
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s6$Scenario: You paste a 40-page PDF class policy into a blank chat vs into a Project with that file pinned. Which is more likely to give grounded, on-policy answers?$s6$
  );
