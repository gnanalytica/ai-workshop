update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: A claim in Perplexity looks perfect but the abstract does not support the sentence. What do you do first?","type":"single","options":[{"text":"Rewrite or drop the claim after opening the source.","correct":true},{"text":"Keep it if the answer sounds fluent.","correct":false},{"text":"Ask the model 'are you sure' three times.","correct":false},{"text":"Add more adjectives and resubmit.","correct":false}],"explanation":"Day 7 four-step check: click → source exists → claim matches → date."},
  {"q":"Look back (Day 6): Memory vs Projects — best distinction?","type":"single","options":[{"text":"Memory stores durable facts about you across chats; Projects pin files + instructions for a workspace.","correct":true},{"text":"They are the same feature.","correct":false},{"text":"Memory only works offline.","correct":false},{"text":"Projects cannot hold files.","correct":false}],"explanation":"Recall before research outputs hit the capstone brief."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 7
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s7$Scenario: A claim in Perplexity looks perfect but the abstract does not support the sentence. What do you do first?$s7$;
