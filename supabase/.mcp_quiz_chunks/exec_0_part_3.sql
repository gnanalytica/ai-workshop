update public.quizzes set questions = coalesce(questions, '[]'::jsonb) || $json$[
  {"q":"Scenario: Outputs vary wildly in tone between runs. Which CREATE knob do you tighten first?","type":"single","options":[{"text":"Tone + active constraints (and examples if needed).","correct":true},{"text":"Delete all context to save tokens.","correct":false},{"text":"Ask for JSON only, no tone.","correct":false},{"text":"Switch models blindly until one works.","correct":false}],"explanation":"T and A (tone, constraints) stabilize voice; E gives format anchors."},
  {"q":"Look back (Day 3): Open-weight vs closed-weight means:","type":"single","options":[{"text":"Open = downloadable model weights; closed = API-only behind a vendor.","correct":true},{"text":"Open = free; closed = paid only.","correct":false},{"text":"Open = runs only on phone.","correct":false},{"text":"There is no real difference.","correct":false}],"explanation":"Recall from tool landscape before context engineering week."}
]$json$::jsonb
where cohort_id = '56268633-9e93-4305-af6a-1b622a833d8e' and day_number = 4
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(questions, '[]'::jsonb)) as elem
    where elem->>'q' = $s4$Scenario: Outputs vary wildly in tone between runs. Which CREATE knob do you tighten first?$s4$;
