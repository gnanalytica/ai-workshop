-- =============================================================================
-- supabase/seed/fix_team_records_2026_06_11.sql
-- Targeted fixes for KBN internship team records (requested 2026-06-11):
--   1. DS Team 7   / roll 245229 — correct name to "V Durga Charan Teja"
--   2. Team DS 9   / roll 245238 — add member P Swamy
--   3. Team 4 (DS) / roll 245209 — correct name to "Y Vinay"
--   4. DS Team 5   / roll 245211 — add member G Mounika (create team if absent)
--   5. Stat Team 2 / roll 243508 — add member Srinivas
--
-- NON-DESTRUCTIVE: only UPDATE profiles.full_name and INSERT teams/team_members.
-- No rows are deleted; member inserts are ON CONFLICT DO NOTHING, so the script
-- is safe to re-run. Do NOT re-run teams.sql instead — it wipes team
-- submissions and grades for the whole cohort.
--
-- Run once against production:
--   psql "$DB_URL" -f supabase/seed/fix_team_records_2026_06_11.sql
--
-- Watch the NOTICE/WARNING output: if a roll number has no confirmed
-- registration (students self-enter rolls on first login, so typos/blanks
-- happen), that change is skipped and candidate students with a similar name
-- are listed so you can fix the registration's roll_number first.
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_cohort uuid;
  v_user   uuid;
  v_team   uuid;
  v_old    text;
  v_next   int;
  r        record;
BEGIN
  -- ---- Resolve the active cohort from a known roll number (same anchor as teams.sql)
  SELECT reg.cohort_id INTO STRICT v_cohort
    FROM registrations reg
   WHERE reg.roll_number = '245210'
     AND reg.status = 'confirmed'
   LIMIT 1;

  RAISE NOTICE 'Fixing team records for cohort %', v_cohort;

  -- ==========================================================================
  -- 1. DS Team 7 / roll 245229 — correct name to "V Durga Charan Teja"
  -- ==========================================================================
  SELECT reg.user_id INTO v_user
    FROM registrations reg
   WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
     AND reg.roll_number = '245229';
  IF v_user IS NULL THEN
    RAISE WARNING '[1] No confirmed registration with roll 245229 — name NOT changed';
  ELSE
    SELECT full_name INTO v_old FROM profiles WHERE id = v_user;
    UPDATE profiles SET full_name = 'V Durga Charan Teja' WHERE id = v_user;
    RAISE NOTICE '[1] roll 245229 renamed: "%" -> "V Durga Charan Teja"', v_old;
  END IF;

  -- ==========================================================================
  -- 2. Team DS 9 / roll 245238 — add member P Swamy
  -- ==========================================================================
  SELECT t.id INTO v_team
    FROM teams t
   WHERE t.cohort_id = v_cohort
     AND lower(replace(t.name, ' ', '')) = 'teamds9';
  SELECT reg.user_id INTO v_user
    FROM registrations reg
   WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
     AND reg.roll_number = '245238';
  IF v_team IS NULL THEN
    RAISE WARNING '[2] Team "Team DS 9" not found — member NOT added';
  ELSIF v_user IS NULL THEN
    RAISE WARNING '[2] No confirmed registration with roll 245238 (P Swamy) — member NOT added. Set roll_number on the student''s registration, then re-run.';
    FOR r IN
      SELECT p.full_name, reg.roll_number
        FROM registrations reg JOIN profiles p ON p.id = reg.user_id
       WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
         AND p.full_name ILIKE '%swamy%'
    LOOP
      RAISE NOTICE '[2]   candidate: "%" (roll %)', r.full_name, coalesce(r.roll_number, 'none');
    END LOOP;
  ELSE
    INSERT INTO team_members (team_id, user_id)
    VALUES (v_team, v_user)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '[2] roll 245238 (P Swamy) is now a member of Team DS 9';
  END IF;

  -- ==========================================================================
  -- 3. Team 4 (DS) / roll 245209 — correct name to "Y Vinay"
  -- ==========================================================================
  SELECT reg.user_id INTO v_user
    FROM registrations reg
   WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
     AND reg.roll_number = '245209';
  IF v_user IS NULL THEN
    RAISE WARNING '[3] No confirmed registration with roll 245209 — name NOT changed';
  ELSE
    SELECT full_name INTO v_old FROM profiles WHERE id = v_user;
    UPDATE profiles SET full_name = 'Y Vinay' WHERE id = v_user;
    RAISE NOTICE '[3] roll 245209 renamed: "%" -> "Y Vinay"', v_old;
  END IF;

  -- ==========================================================================
  -- 4. DS Team 5 / roll 245211 — add member G Mounika (create team if absent)
  -- ==========================================================================
  SELECT t.id INTO v_team
    FROM teams t
   WHERE t.cohort_id = v_cohort
     AND lower(replace(t.name, ' ', '')) = 'dsteam5';
  IF v_team IS NULL THEN
    SELECT coalesce(max(team_number), 0) + 1 INTO v_next
      FROM teams WHERE cohort_id = v_cohort;
    INSERT INTO teams (cohort_id, name, team_number)
    VALUES (v_cohort, 'DS Team 5', v_next)
    RETURNING id INTO v_team;
    RAISE NOTICE '[4] created team "DS Team 5" (team_number %)', v_next;
  END IF;
  SELECT reg.user_id INTO v_user
    FROM registrations reg
   WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
     AND reg.roll_number = '245211';
  IF v_user IS NULL THEN
    RAISE WARNING '[4] No confirmed registration with roll 245211 (G Mounika) — member NOT added. Set roll_number on the student''s registration, then re-run.';
    FOR r IN
      SELECT p.full_name, reg.roll_number
        FROM registrations reg JOIN profiles p ON p.id = reg.user_id
       WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
         AND p.full_name ILIKE '%mounika%'
    LOOP
      RAISE NOTICE '[4]   candidate: "%" (roll %)', r.full_name, coalesce(r.roll_number, 'none');
    END LOOP;
  ELSE
    INSERT INTO team_members (team_id, user_id)
    VALUES (v_team, v_user)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '[4] roll 245211 (G Mounika) is now a member of DS Team 5';
  END IF;

  -- ==========================================================================
  -- 5. Stat Team 2 / roll 243508 — add member Srinivas
  -- ==========================================================================
  SELECT t.id INTO v_team
    FROM teams t
   WHERE t.cohort_id = v_cohort
     AND lower(replace(t.name, ' ', '')) = 'statteam2';
  SELECT reg.user_id INTO v_user
    FROM registrations reg
   WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
     AND reg.roll_number = '243508';
  IF v_team IS NULL THEN
    RAISE WARNING '[5] Team "Stat Team 2" not found — member NOT added';
  ELSIF v_user IS NULL THEN
    RAISE WARNING '[5] No confirmed registration with roll 243508 (Srinivas) — member NOT added. Set roll_number on the student''s registration, then re-run.';
    FOR r IN
      SELECT p.full_name, reg.roll_number
        FROM registrations reg JOIN profiles p ON p.id = reg.user_id
       WHERE reg.cohort_id = v_cohort AND reg.status = 'confirmed'
         AND p.full_name ILIKE '%srinivas%'
    LOOP
      RAISE NOTICE '[5]   candidate: "%" (roll %)', r.full_name, coalesce(r.roll_number, 'none');
    END LOOP;
  ELSE
    INSERT INTO team_members (team_id, user_id)
    VALUES (v_team, v_user)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '[5] roll 243508 (Srinivas) is now a member of Stat Team 2';
  END IF;

END $$;

COMMIT;
