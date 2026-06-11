-- =============================================================================
-- supabase/seed/fix_team_records_2026_06_11.sql
-- Targeted fixes for KBN internship team records (requested 2026-06-11).
--
-- Investigation against the live DB showed the real situation differs from the
-- request's surface reading:
--   * P.srinivas (a STAT student, real roll 243508) registered with roll
--     245229 — which belongs to V Durga Charan Teja (DS). That single typo
--     put Srinivas's name on DS Team 7 AND kept him off Stat Team 2.
--   * Durga Charan Teja registered with garbled roll "k2247829245229".
--   * G Mounika is confirmed but has no roll number, so she never landed in
--     DS Team 5 (which already exists in the live DB with 3 members).
--   * P Swamy (roll 245238) has NO account at all — he must sign in first;
--     his DS Team 9 membership cannot be created yet.
--
-- Fixes applied (single transaction; identity-checked; only one row deleted —
-- Srinivas's incorrect DS Team 7 membership, replaced by his correct
-- Stat Team 2 membership):
--   1. Roll swap: Srinivas 245229 -> 243508, then Durga -> 245229.
--   2. Names: Durga -> "V Durga Charan Teja"; roll 245209 -> "Y Vinay".
--   3. DS Team 7: remove Srinivas, add Durga.
--   4. Stat Team 2: add Srinivas.
--   5. DS Team 5: set Mounika's roll to 245211, add her.
--
-- Run once against production:
--   psql "$DB_URL" -f supabase/seed/fix_team_records_2026_06_11.sql
-- (or: supabase db query --linked -f <this file>)
--
-- Idempotent: re-running after success is a no-op (the STRICT lookups below
-- find nothing left to fix and abort the transaction without changes).
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_cohort   uuid;
  v_srinivas uuid;
  v_durga    uuid;
  v_vinay    uuid;
  v_mounika  uuid;
  v_t7       uuid;
  v_t5       uuid;
  v_stat2    uuid;
BEGIN
  -- ---- Resolve cohort (same anchor as teams.sql) ---------------------------
  SELECT reg.cohort_id INTO STRICT v_cohort
    FROM registrations reg
   WHERE reg.roll_number = '245210' AND reg.status = 'confirmed'
   LIMIT 1;

  -- ---- Resolve the students by their CURRENT (wrong) identifiers -----------
  SELECT user_id INTO STRICT v_srinivas FROM registrations
   WHERE cohort_id = v_cohort AND status = 'confirmed' AND roll_number = '245229';
  SELECT user_id INTO STRICT v_durga FROM registrations
   WHERE cohort_id = v_cohort AND status = 'confirmed' AND roll_number = 'k2247829245229';
  SELECT user_id INTO STRICT v_vinay FROM registrations
   WHERE cohort_id = v_cohort AND status = 'confirmed' AND roll_number = '245209';
  SELECT r.user_id INTO STRICT v_mounika
    FROM registrations r JOIN profiles p ON p.id = r.user_id
   WHERE r.cohort_id = v_cohort AND r.status = 'confirmed'
     AND r.roll_number IS NULL AND p.full_name = 'GANDABOYINA Mounika DS';

  -- ---- Identity safety checks: abort if the DB no longer matches -----------
  IF (SELECT full_name FROM profiles WHERE id = v_srinivas) NOT ILIKE '%srinivas%' THEN
    RAISE EXCEPTION 'identity check failed: roll 245229 is not Srinivas';
  END IF;
  IF (SELECT full_name FROM profiles WHERE id = v_durga) NOT ILIKE '%durga%teja%' THEN
    RAISE EXCEPTION 'identity check failed: roll k2247829245229 is not Durga Charan Teja';
  END IF;
  IF (SELECT full_name FROM profiles WHERE id = v_vinay) NOT ILIKE '%vinay%' THEN
    RAISE EXCEPTION 'identity check failed: roll 245209 is not Vinay';
  END IF;

  -- ---- Resolve teams (live names, which differ from teams.sql) -------------
  SELECT id INTO STRICT v_t7    FROM teams WHERE cohort_id = v_cohort AND name = 'DS Team 7';
  SELECT id INTO STRICT v_t5    FROM teams WHERE cohort_id = v_cohort AND name = 'DS Team 5';
  SELECT id INTO STRICT v_stat2 FROM teams WHERE cohort_id = v_cohort AND name = 'Stat Team 2';

  -- ---- 1. Roll swap: free 245229 first, then hand it to Durga --------------
  UPDATE registrations SET roll_number = '243508'
   WHERE cohort_id = v_cohort AND user_id = v_srinivas;
  UPDATE registrations SET roll_number = '245229'
   WHERE cohort_id = v_cohort AND user_id = v_durga;
  RAISE NOTICE 'roll swap done: Srinivas -> 243508, Durga -> 245229';

  -- ---- 2. Name corrections --------------------------------------------------
  UPDATE profiles SET full_name = 'V Durga Charan Teja' WHERE id = v_durga;
  UPDATE profiles SET full_name = 'Y Vinay'             WHERE id = v_vinay;
  RAISE NOTICE 'names corrected: V Durga Charan Teja (245229), Y Vinay (245209)';

  -- ---- 3+4. DS Team 7: Srinivas out, Durga in; Stat Team 2: Srinivas in ----
  DELETE FROM team_members WHERE team_id = v_t7 AND user_id = v_srinivas;
  INSERT INTO team_members (team_id, user_id) VALUES (v_t7, v_durga)
  ON CONFLICT DO NOTHING;
  INSERT INTO team_members (team_id, user_id) VALUES (v_stat2, v_srinivas)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'memberships fixed: DS Team 7 = Durga, Stat Team 2 += Srinivas';

  -- ---- 5. Mounika: assign roll 245211 and add to DS Team 5 ------------------
  UPDATE registrations SET roll_number = '245211'
   WHERE cohort_id = v_cohort AND user_id = v_mounika;
  INSERT INTO team_members (team_id, user_id) VALUES (v_t5, v_mounika)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'Mounika: roll 245211 set, added to DS Team 5';

  -- ---- P Swamy (245238, DS Team 9): NOT possible — no account exists -------
  -- Once he signs in and his registration is confirmed with roll 245238, run:
  --   insert into team_members (team_id, user_id)
  --   select t.id, r.user_id from teams t, registrations r
  --    where t.cohort_id = r.cohort_id and t.name = 'DS Team 9'
  --      and r.status = 'confirmed' and r.roll_number = '245238'
  --   on conflict do nothing;

END $$;

COMMIT;
