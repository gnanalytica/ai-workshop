-- Filter soft-deleted announcements from read paths; allow Exec Faculty to
-- post in their cohort and soft-delete their own posts.
-- Applied 2026-04-24 via Supabase MCP. Note: announcements uses `posted_by`
-- (not `author_id`) — spec and first draft of this migration were wrong.

drop policy if exists ann_auth_read on public.announcements;
create policy ann_auth_read on public.announcements
  for select to authenticated
  using (deleted_at is null);

drop policy if exists ann_exec_insert on public.announcements;
create policy ann_exec_insert on public.announcements
  for insert to authenticated
  with check (
    cohort_id in (select public.executive_cohort_ids())
  );

drop policy if exists ann_exec_soft_delete_own on public.announcements;
create policy ann_exec_soft_delete_own on public.announcements
  for update to authenticated
  using (
    posted_by = auth.uid()
    and cohort_id in (select public.executive_cohort_ids())
  )
  with check (
    posted_by = auth.uid()
    and cohort_id in (select public.executive_cohort_ids())
  );
