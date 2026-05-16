-- 0102_rubrics_day6_to_10.sql
-- Adds rubric templates for the 5 assignments on Days 6–10 that were
-- missing one, and links each assignment to its template. Also sets
-- auto_grade=false on the linked assignments so attaching a rubric
-- doesn't silently start auto-grading new submissions — admins can
-- re-enable per-assignment from the editor.
--
-- Cohort: KBN internship 2026-05 (fbd78241-…). Targets specific
-- assignment ids fetched on 2026-05-16.

do $$
declare
  r_d6_capstone  uuid := gen_random_uuid();
  r_d7           uuid := gen_random_uuid();
  r_d8           uuid := gen_random_uuid();
  r_d9           uuid := gen_random_uuid();
  r_d10          uuid := gen_random_uuid();
begin
  insert into rubric_templates (id, title, criteria) values
    (r_d6_capstone, 'Day 6 · Capstone · 5 ideas with references', jsonb_build_object(
      'criteria', jsonb_build_array(
        jsonb_build_object('key','five_ideas','name','Five distinct ideas','max',3,
          'anchors', jsonb_build_object('0','Nothing submitted.','1','Fewer than 5 ideas or all variants of one.','2','5 ideas, but several overlap.','3','5 clearly distinct ideas.')),
        jsonb_build_object('key','references','name','Reference quality','max',3,
          'anchors', jsonb_build_object('0','No references.','1','LLM-paraphrased noise or invented sources.','2','Some credible sources, mixed quality.','3','Specific, credible references per idea (papers, articles, products, repos).')),
        jsonb_build_object('key','alignment','name','Idea–reference alignment','max',2,
          'anchors', jsonb_build_object('0','References don''t match ideas.','1','Most ideas cite ≥1 supporting reference.','2','Every idea cites at least one reference that genuinely supports it.')),
        jsonb_build_object('key','rationale','name','Personal take / why these','max',2,
          'anchors', jsonb_build_object('0','No rationale.','1','One-liner per idea, generic.','2','Clear rationale for shortlisting these five over alternatives.'))
      ),
      'scale_max', 10,
      'auto_grade_hints', jsonb_build_object(
        'red_flags', jsonb_build_array('fabricated citations','5 ideas that are minor variants of one','no rationale section'),
        'evidence_required', jsonb_build_array('5 distinct ideas','citations per idea','rationale for the shortlist')
      )
    )),

    (r_d7, 'Day 7 · Lab · Sharpen the M1 problem', jsonb_build_object(
      'criteria', jsonb_build_array(
        jsonb_build_object('key','heilmeier','name','Heilmeier rigor','max',3,
          'anchors', jsonb_build_object('0','Heilmeier not attempted.','1','Some of the 9 questions answered, hand-wavy.','2','All 9 answered but several are vague.','3','All 9 answered with one-line, ruthless responses.')),
        jsonb_build_object('key','five_whys','name','5 Whys depth','max',3,
          'anchors', jsonb_build_object('0','No 5 Whys ladder.','1','Stops at 2–3 levels.','2','4 levels, last few feel forced.','3','Full 5-level ladder reaching a plausible root cause.')),
        jsonb_build_object('key','hmw','name','HMW range','max',2,
          'anchors', jsonb_build_object('0','No HMW reframes.','1','3 reframes but they open the same design space.','2','3 distinct "How might we…" reframes opening different design spaces.')),
        jsonb_build_object('key','tweet','name','Tweet sharpness','max',2,
          'anchors', jsonb_build_object('0','No tweet-length statement.','1','≤280 chars but vague or restates the symptom.','2','≤280 chars, sharper than the original, survives all three frameworks.'))
      ),
      'scale_max', 10,
      'auto_grade_hints', jsonb_build_object(
        'red_flags', jsonb_build_array('Heilmeier with <9 answers','5 Whys ladder copy-pasted from the prompt','HMW reframes that are paraphrases of each other','tweet >280 chars'),
        'evidence_required', jsonb_build_array('9-question scorecard','5-level Whys ladder','3 HMW reframes','final tweet-length statement')
      )
    )),

    (r_d8, 'Day 8 · Lab · One full design-thinking loop', jsonb_build_object(
      'criteria', jsonb_build_array(
        jsonb_build_object('key','interviews','name','Real interviews','max',3,
          'anchors', jsonb_build_object('0','No interviews.','1','Fewer than 3, or interviews without quotes.','2','3 interviews with quotes, but quotes paraphrased not verbatim.','3','3 real interviews, 2 verbatim quotes per person.')),
        jsonb_build_object('key','define','name','Sharp Define statement','max',2,
          'anchors', jsonb_build_object('0','No define statement.','1','User-needs-X form, but the "surprising insight" is generic.','2','Full form with a non-obvious insight from the interviews.')),
        jsonb_build_object('key','ideas','name','10 ideas','max',1,
          'anchors', jsonb_build_object('0','Fewer than 10, or top-1 not chosen.','1','10 brainstormed solutions listed; top-1 marked.')),
        jsonb_build_object('key','prototype','name','Low-fi prototype','max',2,
          'anchors', jsonb_build_object('0','No prototype.','1','Prototype attached but missing key flow.','2','One-screen Figma/Canva mock — visible, throwaway quality, covers the proposed solution.')),
        jsonb_build_object('key','test','name','User test feedback','max',2,
          'anchors', jsonb_build_object('0','No user test.','1','Feedback from <2 interviewees, or paraphrased.','2','Verbatim reactions from 2 of the 3 interviewees on the prototype.'))
      ),
      'scale_max', 10,
      'auto_grade_hints', jsonb_build_object(
        'red_flags', jsonb_build_array('interviewees with the same wording (LLM-generated)','prototype is a screenshot of someone else''s product','define statement uses the prompt''s placeholder text'),
        'evidence_required', jsonb_build_array('3 named interviews','2 verbatim quotes/person','1-line define statement','10 ideas','prototype link','user-test reactions')
      )
    )),

    (r_d9, 'Day 9 · Lab · User Interview', jsonb_build_object(
      'criteria', jsonb_build_array(
        jsonb_build_object('key','insights','name','Key insights','max',3,
          'anchors', jsonb_build_object('0','No insights captured.','1','Generic summary, no patterns named.','2','Some specific themes, others abstract.','3','Specific themes / patterns named with crisp framing.')),
        jsonb_build_object('key','process','name','Process reflection','max',2,
          'anchors', jsonb_build_object('0','No reflection.','1','Platitudes — "it went well".','2','What worked + what was hard, with concrete examples.')),
        jsonb_build_object('key','takeaways','name','5 useful takeaways','max',3,
          'anchors', jsonb_build_object('0','None.','1','<5, or generic clichés.','2','5 takeaways but several overlap.','3','5 distinct, actionable lessons for the next interview.')),
        jsonb_build_object('key','evidence','name','Evidence','max',2,
          'anchors', jsonb_build_object('0','No examples.','1','One example, abstract.','2','Multiple examples / quotes from the actual conversation.'))
      ),
      'scale_max', 10,
      'auto_grade_hints', jsonb_build_object(
        'red_flags', jsonb_build_array('summary reads like an LLM-generated reflection','same insight restated 5 times','no quotes from the actual interview'),
        'evidence_required', jsonb_build_array('named themes','process notes','5 takeaways','quotes or examples')
      )
    )),

    (r_d10, 'Day 10 · Lab · Causal-loop diagram + SCQA', jsonb_build_object(
      'criteria', jsonb_build_array(
        jsonb_build_object('key','diagram','name','Causal-loop diagram','max',3,
          'anchors', jsonb_build_object('0','No diagram.','1','Diagram with <5 nodes, or no link/PNG.','2','5–7 nodes but messy / unlabeled.','3','5–7 labeled nodes; public link or PNG attached.')),
        jsonb_build_object('key','loops','name','R / B loop labels','max',2,
          'anchors', jsonb_build_object('0','No loop labels.','1','Some loops labeled.','2','Every loop marked reinforcing (R) or balancing (B).')),
        jsonb_build_object('key','leverage','name','Leverage point + why','max',2,
          'anchors', jsonb_build_object('0','No leverage point.','1','Point circled but no justification.','2','One node circled, with a clear one-line rationale.')),
        jsonb_build_object('key','scqa','name','SCQA pitch','max',3,
          'anchors', jsonb_build_object('0','No pitch.','1','Some lines present, incoherent.','2','All 4 lines present but generic.','3','Tight 4-line Situation / Complication / Question / Answer that holds together.'))
      ),
      'scale_max', 10,
      'auto_grade_hints', jsonb_build_object(
        'red_flags', jsonb_build_array('no diagram link / PNG attached','SCQA pitched but no diagram','leverage point chosen without referencing any loop'),
        'evidence_required', jsonb_build_array('diagram link','R/B labels per loop','circled leverage node + justification','4-line SCQA')
      )
    ));

  update assignments set rubric_id = r_d6_capstone, auto_grade = false
   where id = '2bfed2f3-5ade-4f42-8b2d-52483a0857e1';
  update assignments set rubric_id = r_d7,          auto_grade = false
   where id = '129ef625-a25f-463b-9aeb-0955daa14f4c';
  update assignments set rubric_id = r_d8,          auto_grade = false
   where id = 'ad53a58b-2d1a-4922-9dbf-b10d25e64608';
  update assignments set rubric_id = r_d9,          auto_grade = false
   where id = 'd4c06caa-4356-4e73-b2ff-66fce678f0da';
  update assignments set rubric_id = r_d10,         auto_grade = false
   where id = 'db2b2e8c-e943-412b-b414-0b3c8566cdce';
end $$;
