-- =============================================================================
-- NNNN_<description>.sql
--
-- <One-paragraph summary: what this migration does and why.>
-- =============================================================================

-- ----- enums (if any) --------------------------------------------------------
-- create type my_enum as enum ('a', 'b');

-- ----- tables ----------------------------------------------------------------
-- create table if not exists my_table (
--   id          uuid primary key default gen_random_uuid(),
--   cohort_id   uuid not null references cohorts (id)  on delete cascade,
--   user_id     uuid not null references profiles (id) on delete cascade,
--   created_at  timestamptz not null default now(),
--   updated_at  timestamptz not null default now(),
--   unique (cohort_id, user_id)
-- );

-- create index if not exists my_table_cohort_idx on my_table (cohort_id);

-- ----- updated_at trigger ----------------------------------------------------
-- drop trigger if exists trg_my_table_updated on my_table;
-- create trigger trg_my_table_updated
--   before update on my_table
--   for each row execute function set_updated_at();

-- ----- RLS -------------------------------------------------------------------
-- alter table my_table enable row level security;
--
-- drop policy if exists my_table_self        on my_table;
-- drop policy if exists my_table_self_write  on my_table;
-- drop policy if exists my_table_staff_read  on my_table;
--
-- create policy my_table_self on my_table
--   for select using (user_id = auth.uid() and is_enrolled_in(cohort_id));
-- create policy my_table_self_write on my_table
--   for insert with check (user_id = auth.uid() and is_enrolled_in(cohort_id));
-- create policy my_table_staff_read on my_table
--   for select using (has_cap('roster.read', cohort_id));

-- ----- grants ----------------------------------------------------------------
-- grant select, insert, update on my_table to authenticated;

-- ----- views (always security_invoker = on) ----------------------------------
-- create view v_my_view with (security_invoker = on) as
--   select ...
-- ;
-- grant select on v_my_view to authenticated;

-- ----- enum type-swap recipe (only if needed) --------------------------------
-- See the skill's SKILL.md for the full recipe. Order:
--   1. drop view if exists ...   (every dependent view)
--   2. drop policy if exists ... (every dependent policy)
--   3. alter table ... alter column ... drop default;
--   4. alter type ... rename to ..._old; create type ... as enum (...);
--      alter table ... alter column ... type ... using ...::text::...;
--      alter table ... alter column ... set default '...';
--      drop type ..._old;
--   5. recreate policies
--   6. recreate views (with security_invoker = on)
