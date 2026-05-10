-- 0090_day6_quiz_week1_revision.sql
--
-- Day 6 of the KBN Internship · Apr 2026 cohort was reframed as a Week 1
-- revision day (revision + Say-What-You-See game + Capstone M1 kickoff).
--
-- The existing Day 6 quiz (b7be9b6b-0384-4e45-ad2c-c356f650fe7a) currently
-- has 3 questions targeted at the old framing and 0 attempts, so it is
-- safe to replace in place. We:
--   1. update the quiz title + bump version
--   2. delete the old questions
--   3. insert the 10 Week-1 revision questions
--
-- Options follow the normalized [{id, label}] shape (see 0081); answer for
-- 'single' is the option id ("0".."3").
-- =============================================================================

begin;

-- 1. Update the title + bump version on the live cohort's Day 6 quiz.
update quizzes
   set title = 'Day 6: Week 1 Revision',
       version = version + 1
 where id = 'b7be9b6b-0384-4e45-ad2c-c356f650fe7a';

-- 2. Clear out the old 3 questions (no attempts on this quiz, so safe).
delete from quiz_questions
 where quiz_id = 'b7be9b6b-0384-4e45-ad2c-c356f650fe7a';

-- 3. Insert the 10 Week-1 revision questions.
insert into quiz_questions (quiz_id, ordinal, prompt, kind, options, answer)
values
  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 1,
   'Which of these is NOT a chatbot?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','ChatGPT'),
     jsonb_build_object('id','1','label','Claude'),
     jsonb_build_object('id','2','label','AlphaFold'),
     jsonb_build_object('id','3','label','Gemini')),
   to_jsonb('2'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 2,
   'AI is "confidently wrong" some of the time. What is this called?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Glitch'),
     jsonb_build_object('id','1','label','Hallucination'),
     jsonb_build_object('id','2','label','Bias'),
     jsonb_build_object('id','3','label','Prompt drift')),
   to_jsonb('1'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 3,
   'The same sentence in English and in Hindi (Devanagari) is sent to GPT-4. Which is true about token counts?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','They use the same number of tokens'),
     jsonb_build_object('id','1','label','The Hindi version uses fewer tokens'),
     jsonb_build_object('id','2','label','The Hindi version uses roughly 4x more tokens'),
     jsonb_build_object('id','3','label','Hindi is rejected by the tokenizer')),
   to_jsonb('2'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 4,
   'In an LLM, attention does what?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Stores long-term memory'),
     jsonb_build_object('id','1','label','Decides which earlier tokens matter most for the next prediction'),
     jsonb_build_object('id','2','label','Generates new training data'),
     jsonb_build_object('id','3','label','Translates between languages')),
   to_jsonb('1'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 5,
   'The "C" in the CREATE prompting framework stands for...',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Constraints'),
     jsonb_build_object('id','1','label','Character'),
     jsonb_build_object('id','2','label','Context'),
     jsonb_build_object('id','3','label','Clarity')),
   to_jsonb('1'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 6,
   'Few-shot prompting means...',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Sending the same prompt many times'),
     jsonb_build_object('id','1','label','Reducing the model temperature'),
     jsonb_build_object('id','2','label','Giving the model 1 to 5 examples in the prompt'),
     jsonb_build_object('id','3','label','Using a smaller model')),
   to_jsonb('2'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 7,
   'Sarvam-1 is built primarily for...',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Image generation'),
     jsonb_build_object('id','1','label','10 Indic languages'),
     jsonb_build_object('id','2','label','English coding tasks'),
     jsonb_build_object('id','3','label','Speech synthesis')),
   to_jsonb('1'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 8,
   'Which of these is an open-weight model?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','GPT-4'),
     jsonb_build_object('id','1','label','Claude 3.5'),
     jsonb_build_object('id','2','label','Mistral 7B'),
     jsonb_build_object('id','3','label','Gemini 1.5')),
   to_jsonb('2'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 9,
   'Why use Perplexity or Deep Research over plain ChatGPT for fact questions?',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','It is faster'),
     jsonb_build_object('id','1','label','It cites sources you can verify'),
     jsonb_build_object('id','2','label','It uses fewer tokens'),
     jsonb_build_object('id','3','label','It is free')),
   to_jsonb('1'::text)),

  ('b7be9b6b-0384-4e45-ad2c-c356f650fe7a', 10,
   'NotebookLM is best for...',
   'single',
   jsonb_build_array(
     jsonb_build_object('id','0','label','Drawing images'),
     jsonb_build_object('id','1','label','Asking questions grounded in your own PDFs and notes'),
     jsonb_build_object('id','2','label','Writing code'),
     jsonb_build_object('id','3','label','Real-time web search')),
   to_jsonb('1'::text));

commit;
