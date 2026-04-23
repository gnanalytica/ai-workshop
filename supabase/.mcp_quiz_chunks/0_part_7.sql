update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: You need a LinkedIn-safe hero image for a real employer brand. Which path matches Day 8 licensing advice?","type":"single","options":[{"text":"Prefer a commercially trained image tool (e.g. Firefly-class) or own compositing.","correct":true},{"text":"Any random SD checkpoint from Reddit.","correct":false},{"text":"Skip disclosure because C2PA does not exist.","correct":false},{"text":"Use only screenshots of Google Images.","correct":false}],"explanation":"Training-data rights matter for anything you publish."},
  {"q":"Look back (Day 7): NotebookLM refuses the open web on purpose because:","type":"single","options":[{"text":"Answers must ground in YOUR uploaded sources only.","correct":true},{"text":"Google banned search.","correct":false},{"text":"It only supports audio.","correct":false},{"text":"It cannot read PDFs.","correct":false}],"explanation":"Contrast research tools before creative deliverables stack."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 8
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s8$Scenario: You need a LinkedIn-safe hero image for a real employer brand. Which path matches Day 8 licensing advice?$s8$
  );
