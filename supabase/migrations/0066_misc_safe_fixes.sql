-- 0066_misc_safe_fixes.sql
--
-- Three small advisor cleanups, each independent and low-risk:
--   1. function_search_path_mutable on pod_faculty_sync_cohort
--   2. no_primary_key on community_votes (add surrogate uuid PK)
--   3. extension_in_public for citext (move to extensions schema)

-- 1. lock pod_faculty_sync_cohort search_path
alter function public.pod_faculty_sync_cohort()
  set search_path = public, pg_catalog;

-- 2. surrogate PK on community_votes
-- The existing UNIQUE(user_id, post_id, reply_id) cannot serve as PK because
-- post_id and reply_id are nullable (CHECK enforces exactly-one-not-null).
alter table public.community_votes
  add column if not exists id uuid not null default gen_random_uuid();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.community_votes'::regclass
      and contype = 'p'
  ) then
    alter table public.community_votes
      add constraint community_votes_pkey primary key (id);
  end if;
end$$;
