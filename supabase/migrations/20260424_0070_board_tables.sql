-- Community Q&A board. Platform-wide by default (cohort_id null).
-- Covers tech + concept + setup questions. Tag-filtered in UI.
-- Applied 2026-04-24 via Supabase MCP.

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  cohort_id uuid null references public.cohorts(id) on delete set null,
  title text not null,
  body_md text not null,
  tags text[] not null default '{}',
  status text not null default 'open',
  pinned_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint board_posts_title_len check (char_length(title) between 3 and 140),
  constraint board_posts_status_vals check (status in ('open','answered','closed')),
  constraint board_posts_tags_vocab check (
    tags <@ array['tech','concept','setup','platform','lab','general']::text[]
  )
);

create index if not exists board_posts_created_idx
  on public.board_posts (created_at desc) where deleted_at is null;
create index if not exists board_posts_tags_gin
  on public.board_posts using gin (tags) where deleted_at is null;
create index if not exists board_posts_status_idx
  on public.board_posts (status) where deleted_at is null;

create table if not exists public.board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body_md text not null,
  is_accepted_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists board_replies_post_idx
  on public.board_replies (post_id, created_at) where deleted_at is null;

create table if not exists public.board_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid null references public.board_posts(id) on delete cascade,
  reply_id uuid null references public.board_replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint board_votes_xor check ((post_id is null) <> (reply_id is null))
);

create unique index if not exists board_votes_user_post
  on public.board_votes (user_id, post_id) where post_id is not null;
create unique index if not exists board_votes_user_reply
  on public.board_votes (user_id, reply_id) where reply_id is not null;

alter table public.board_posts enable row level security;
alter table public.board_replies enable row level security;
alter table public.board_votes enable row level security;

create policy bp_read on public.board_posts
  for select to authenticated using (deleted_at is null);

create policy bp_insert on public.board_posts
  for insert to authenticated with check (author_id = auth.uid() and deleted_at is null);

create policy bp_update_author on public.board_posts
  for update to authenticated
  using (author_id = auth.uid() and created_at > now() - interval '15 minutes')
  with check (author_id = auth.uid());

create policy bp_update_mod on public.board_posts
  for update to authenticated
  using (
    public.has_staff_role('admin') or public.has_staff_role('trainer') or public.has_staff_role('tech_support')
  )
  with check (true);

create policy br_read on public.board_replies
  for select to authenticated using (deleted_at is null);

create policy br_insert on public.board_replies
  for insert to authenticated with check (author_id = auth.uid() and deleted_at is null);

create policy br_update_author on public.board_replies
  for update to authenticated
  using (author_id = auth.uid() and created_at > now() - interval '15 minutes')
  with check (author_id = auth.uid());

create policy br_update_mod on public.board_replies
  for update to authenticated
  using (
    public.has_staff_role('admin') or public.has_staff_role('trainer') or public.has_staff_role('tech_support')
  )
  with check (true);

create policy bv_read on public.board_votes
  for select to authenticated using (true);

create policy bv_insert on public.board_votes
  for insert to authenticated with check (user_id = auth.uid());

create policy bv_delete_self on public.board_votes
  for delete to authenticated using (user_id = auth.uid());
