-- One-off transfer: put every confirmed student in a cohort who is not yet in any pod
-- into the pod where a given faculty user is primary.
--
-- Edit the two literals below if needed, then run in the Supabase SQL editor (or psql)
-- as a privileged role. Safe to re-run: skips students already in a pod for that cohort.
--
-- Requires: migration 0600_pods_faculty_roster_rls (or equivalent) if you test as faculty via API;
-- this script bypasses RLS when run as postgres/service role.

DO $$
DECLARE
  v_cohort_slug text := 'cohort-01';
  v_faculty_email text := 'sandeep97pvn@gmail.com';
  v_cohort_id uuid;
  v_pod_id uuid;
  v_faculty_uid uuid;
  v_n int;
BEGIN
  SELECT c.id INTO v_cohort_id FROM public.cohorts c WHERE c.slug = v_cohort_slug LIMIT 1;
  IF v_cohort_id IS NULL THEN
    RAISE NOTICE 'cohort slug % not found', v_cohort_slug;
    RETURN;
  END IF;

  SELECT u.id INTO v_faculty_uid
  FROM auth.users u
  WHERE lower(u.email) = lower(v_faculty_email)
  LIMIT 1;
  IF v_faculty_uid IS NULL THEN
    RAISE NOTICE 'auth user for email % not found', v_faculty_email;
    RETURN;
  END IF;

  SELECT cp.id INTO v_pod_id
  FROM public.cohort_pods cp
  JOIN public.pod_faculty pf ON pf.pod_id = cp.id AND pf.is_primary AND pf.faculty_user_id = v_faculty_uid
  WHERE cp.cohort_id = v_cohort_id
  ORDER BY cp.created_at ASC
  LIMIT 1;

  IF v_pod_id IS NULL THEN
    RAISE NOTICE 'No pod in cohort % with primary faculty %', v_cohort_slug, v_faculty_email;
    RETURN;
  END IF;

  INSERT INTO public.pod_members (pod_id, student_user_id, cohort_id)
  SELECT v_pod_id, r.user_id, v_cohort_id
  FROM public.registrations r
  WHERE r.cohort_id = v_cohort_id
    AND r.status = 'confirmed'
    AND NOT EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.student_user_id = r.user_id AND pm.cohort_id = v_cohort_id
    )
  ON CONFLICT (cohort_id, student_user_id) DO NOTHING;

  GET DIAGNOSTICS v_n = ROW_COUNT;
  RAISE NOTICE 'Pod % : inserted % unassigned confirmed student(s) (0 if none left).', v_pod_id, v_n;
END $$;
