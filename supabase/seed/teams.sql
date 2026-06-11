-- =============================================================================
-- supabase/seed/teams.sql
-- Populate teams + team_members from the "Build With AI Group Project" form.
--
-- Run once against production:
--   psql "$DB_URL" -f supabase/seed/teams.sql
--
-- Idempotent: deletes existing teams for the cohort before re-inserting.
--
-- *** DANGER — DATA LOSS ***
-- Re-running this script DELETES team_submissions and team_grades for the
-- whole cohort. Once teams have submitted, do NOT re-run it; apply targeted
-- fixes instead (see fix_team_records_2026_06_11.sql for the pattern).
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_cohort uuid;
  v_team   uuid;
BEGIN
  -- ---- Resolve the active cohort from a known roll number ------------------
  SELECT r.cohort_id INTO STRICT v_cohort
    FROM registrations r
   WHERE r.roll_number = '245210'
     AND r.status = 'confirmed'
   LIMIT 1;

  RAISE NOTICE 'Seeding teams for cohort %', v_cohort;

  -- ---- Clear previous team data for this cohort (cascade deletes members) --
  DELETE FROM team_submissions WHERE cohort_id = v_cohort;
  DELETE FROM team_grades       WHERE cohort_id = v_cohort;
  DELETE FROM team_members      WHERE team_id IN (SELECT id FROM teams WHERE cohort_id = v_cohort);
  DELETE FROM teams             WHERE cohort_id = v_cohort;

  -- ========================================================================
  -- 1. DS Team 3
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 3', 1,
    '["Food waste prediction and reduction", "AI personal career advisor", "Food expiry prediction system"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245210','245213','245214','245236');

  -- ========================================================================
  -- 2. AI Team 6
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 6', 2,
    '["AI Startup Idea Validator", "AI Study Buddy for Students", "AI scam call analyzer"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245917','245925','245940','245958');

  -- ========================================================================
  -- 3. AI Team 4 - Classic Developer
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 4 - Classic Developer', 3,
    '["Generic medicine finder", "AI powered placement and internship readiness platform for students", "WhatsApp/SMS spam detection"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245910','245953','245918','245919');

  -- ========================================================================
  -- 4. AI Team 3
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 3', 4,
    '["Student Attendance Management System", "Fake News Detection", "AI Study Planner"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245916','245920','245934','245954');

  -- ========================================================================
  -- 5. AI Team 9
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 9', 5,
    '["Mobile phone price range estimator", "Daily weather intake remind and alert", "Fake news headline detector using basic text pattern features"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245915','245943','245944','245946');

  -- ========================================================================
  -- 6. AI Team 7
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 7', 6,
    '["AgricultureAI", "Chronic Kidney Disease detection", "Fake mail detection"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245950','245902','245959','245962');

  -- ========================================================================
  -- 7. AI Team 4
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AI Team 4', 7,
    '["AI Travel Planner", "AI College Companion", "AI Knowledge Graph"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245913','245938','245956','245960');

  -- ========================================================================
  -- 8. AIML Boyz
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'AIML Boyz', 8,
    '["Smart college management system", "AI Leave Management System", "Event & Club Management System"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245948','245949','245942','245955');

  -- ========================================================================
  -- 9. BSC Comp Team 3
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'BSC Comp Team 3', 9,
    '["Outfit Rating App", "Choco Scoop", "Beauty Bloom"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243308','243327','243346','243352','243354');

  -- ========================================================================
  -- 10. BSC Team 4
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'BSC Team 4', 10,
    '["AI chatbot for college FAQs", "Student attendance management system", "Option 1"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243337','243343','243317','243319','243329');

  -- ========================================================================
  -- 11. BSC Comp Team 8
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'BSC Comp Team 8', 11,
    '["Food Fusion", "Air Delivery", "QR Generator"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243304','243307','243311','243316','243372');

  -- ========================================================================
  -- 12. Computer 9
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computer 9', 12,
    '["Smart College Assistant", "Hostel Management", "Village Connect Deliver"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243310','243314','243353','243303','243338');

  -- ========================================================================
  -- 13. Computer 6
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computer 6', 13,
    '["Smart event booking system", "Student performance analysis system", "Hot and tasty egg dosa"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243348','243358','243362','243364');

  -- ========================================================================
  -- 14. Computer Team 7
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computer Team 7', 14,
    '["AI-Search Gym Diet", "AI-Search visibility & share of model", "Study plan"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('K2247321','K2247333','K2247366','K2247361','K2247331');

  -- ========================================================================
  -- 15. Computers Team 2
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computers Team 2', 15,
    '["AI career roadmap generator", "AI mock interview platform", "AI startup idea validator"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243359','243320','243367','243350');

  -- ========================================================================
  -- 16. Computers Team 11
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computers Team 11', 16,
    '["Civic tech AI", "Resume parser AI", "Fake news detector"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243301','243312','243325','243335','243336');

  -- ========================================================================
  -- 17. Computers Team 1
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Computers Team 1', 17,
    '["Live college bus tracking system", "Blood donor network", "GolgappaGo"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243313','243326','243349','243355','243357');

  -- ========================================================================
  -- 18. Data Dynamos (AI)
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Data Dynamos (AI)', 18,
    '["FitGenie - Smart Fitness Coach", "MindMitra - AI Emotional Support", "NoteNova - AI Note Generator"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245908','245922','245929','245945');

  -- ========================================================================
  -- 19. DS Team 2
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 2', 19,
    '["AI-Powered Emergency & Rescue Resource Hub", "AI-powered PPT from recordings", "AI-powered attendance system"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245202','245205','245206','245207');

  -- ========================================================================
  -- 20. DS Team 7
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 7', 20,
    '["Smart attendance", "AI Resume", "Outfit planner"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245226','245229','245230','245233');

  -- ========================================================================
  -- 21. DS Team 6
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 6', 21,
    '["Skills improving from student interest", "Smart Med-Search & Booking Assistant", "AI prompt library"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245218','245222','245224','245225');

  -- ========================================================================
  -- 22. DS Team 8
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 8', 22,
    '["Local language learning assistant", "Fitness and diet planner", "Event planner"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245203','245204','245219','245228');

  -- ========================================================================
  -- 23. DS Team 1
  -- NOTE: Roll number 254201 may be a typo for 245201 — included as-is.
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 1', 23,
    '["AI Travel planner", "AI Healthcare Assistant", "AI Food waste Reducer"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('254201','245208','245217','245227');

  -- ========================================================================
  -- 24. Mind Matrix
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Mind Matrix', 24,
    '["AI interview idea buddy", "AI resume improver", "Smart shopping assistant"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245935','245951','245901','245931');

  -- ========================================================================
  -- 25. Stat Team 2
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Stat Team 2', 25,
    '["Data Science & Business Analytics", "Business & Entrepreneurship", "Computer Science & Software Engineering"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243502','243508','243509');

  -- ========================================================================
  -- 26. Statistics Team 01
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Statistics Team 01', 26,
    '["Education & Learning AI", "AI Chatbots & Assistants", "Research & Productivity AI"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('243501','243503','243504','243505','243506','243510');

  -- ========================================================================
  -- 27. Team DS 9
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Team DS 9', 27,
    '["Process Automation and Digitization", "Competitor Landscape or Customer Sentiment Analysis", "Targeted Content Playbook & Asset Creation"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245237','245234','245238');

  -- ========================================================================
  -- 28. Team 2 - Artificial Intelligence
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Team 2 - Artificial Intelligence', 28,
    '["Placementor AI", "AI Resume Analyzer", "AI Interview Coach"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245923','245924','245927','245933');

  -- ========================================================================
  -- 29. Team 4 (DS)
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'Team 4 (DS)', 29,
    '["ChipHub", "AI Monitoring System", "AI Resume Navigator"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245209','245212','245215','245216');

  -- ========================================================================
  -- 30. TechWizards
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'TechWizards', 30,
    '["Local Skill Exchange Platform", "DevTrack AI - Developer Growth Dashboard", "CurriculumX"]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245911','245926','245903','245904');

  -- ========================================================================
  -- 31. DS Team 5 (added 2026-06-11 — see fix_team_records_2026_06_11.sql;
  --     membership mirrors the live board as of that date)
  -- ========================================================================
  INSERT INTO teams (cohort_id, name, team_number, pitched_ideas)
  VALUES (v_cohort, 'DS Team 5', 31, '[]'::jsonb)
  RETURNING id INTO v_team;
  INSERT INTO team_members (team_id, user_id)
    SELECT v_team, r.user_id FROM registrations r
     WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
       AND r.roll_number IN ('245211','245220','245230','245239');

  -- ---- Summary ---------------------------------------------------------------
  RAISE NOTICE 'Inserted % teams, % members for cohort %',
    (SELECT count(*) FROM teams WHERE cohort_id = v_cohort),
    (SELECT count(*) FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE t.cohort_id = v_cohort),
    v_cohort;

END $$;

COMMIT;
