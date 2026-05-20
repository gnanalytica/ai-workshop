-- Tighten two RLS issues flagged by the Supabase advisor:
--
-- 1. `faculty_pod_notes.fpn_write` was `FOR ALL USING (true)` — its USING
--    clause overrode every other policy on the table (RLS policies OR
--    together), effectively bypassing the cohort-faculty scope already
--    encoded in WITH CHECK. Narrow it to INSERT so the existing
--    fpn_read / fpn_update / fpn_delete policies govern those commands.
--
-- 2. `auth_rate_limit` has RLS enabled with no policies — meant to be
--    service-only. Add an explicit deny-all-non-service policy so the
--    intent is documented and the advisor stops flagging it.

drop policy if exists fpn_write on public.faculty_pod_notes;

create policy fpn_write on public.faculty_pod_notes
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      has_staff_role('admin')
      or exists (
        select 1 from cohort_faculty cf
         where cf.cohort_id = faculty_pod_notes.cohort_id
           and cf.user_id = (select auth.uid())
      )
    )
  );

-- auth_rate_limit: explicit deny for end-user roles. The internal rate
-- limiter runs as service_role, which bypasses RLS, so this does not
-- affect its operation.
drop policy if exists arl_deny_all on public.auth_rate_limit;
create policy arl_deny_all on public.auth_rate_limit
  for all
  to anon, authenticated
  using (false)
  with check (false);
