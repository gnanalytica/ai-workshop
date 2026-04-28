-- =============================================================================
-- 0054_help_chat.sql  --  In-product AI help chat persistence + rate limit.
--
-- Phase 6 of the in-product guide. Stores chat conversations & messages so
-- generations are addressable, auditable, and resumable. A SECURITY DEFINER
-- RPC enforces a per-user-per-day cap (30 user messages); admins are exempt.
--
-- Tables created:
--   help_chat_conversations
--   help_chat_messages
--   help_chat_rate_limit
-- =============================================================================

-- ---------- conversations ----------------------------------------------------

create table if not exists help_chat_conversations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles (id) on delete cascade,
  persona         text,
  started_at      timestamptz not null default now(),
  route_at_start  text
);

create index if not exists help_chat_conversations_user_idx
  on help_chat_conversations (user_id, started_at desc);

alter table help_chat_conversations enable row level security;

drop policy if exists help_chat_conv_owner_select on help_chat_conversations;
create policy help_chat_conv_owner_select
  on help_chat_conversations for select
  using (user_id = auth.uid() or has_staff_role('admin'));

drop policy if exists help_chat_conv_owner_insert on help_chat_conversations;
create policy help_chat_conv_owner_insert
  on help_chat_conversations for insert
  with check (user_id = auth.uid());

drop policy if exists help_chat_conv_owner_update on help_chat_conversations;
create policy help_chat_conv_owner_update
  on help_chat_conversations for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists help_chat_conv_owner_delete on help_chat_conversations;
create policy help_chat_conv_owner_delete
  on help_chat_conversations for delete
  using (user_id = auth.uid() or has_staff_role('admin'));

-- ---------- messages ---------------------------------------------------------

create table if not exists help_chat_messages (
  id                 uuid primary key default gen_random_uuid(),
  conversation_id    uuid not null references help_chat_conversations (id) on delete cascade,
  role               text not null check (role in ('system','user','assistant','tool')),
  content            text not null,
  model              text,
  prompt_tokens      int,
  completion_tokens  int,
  client_message_id  uuid unique,
  created_at         timestamptz not null default now()
);

create index if not exists help_chat_messages_conv_idx
  on help_chat_messages (conversation_id, created_at);

alter table help_chat_messages enable row level security;

-- Owner of the parent conversation may read/insert; admins can read all.
drop policy if exists help_chat_msg_owner_select on help_chat_messages;
create policy help_chat_msg_owner_select
  on help_chat_messages for select
  using (
    has_staff_role('admin')
    or exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists help_chat_msg_owner_insert on help_chat_messages;
create policy help_chat_msg_owner_insert
  on help_chat_messages for insert
  with check (
    exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists help_chat_msg_owner_delete on help_chat_messages;
create policy help_chat_msg_owner_delete
  on help_chat_messages for delete
  using (
    has_staff_role('admin')
    or exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

-- ---------- rate limit -------------------------------------------------------
-- Only writable through rpc_help_chat_increment(). RLS denies all direct access
-- to authenticated users; the SECURITY DEFINER RPC bypasses RLS itself.

create table if not exists help_chat_rate_limit (
  user_id  uuid not null,
  day      date not null,
  count    int  not null default 0,
  primary key (user_id, day)
);

alter table help_chat_rate_limit enable row level security;
-- No grant policies → only the RPC (SECURITY DEFINER, owner = postgres) can touch it.

drop policy if exists help_chat_rate_limit_admin_select on help_chat_rate_limit;
create policy help_chat_rate_limit_admin_select
  on help_chat_rate_limit for select
  using (has_staff_role('admin'));

-- ---------- rate-limit RPC ---------------------------------------------------
-- Returns true when the user is under the cap for today (and increments the
-- counter); returns false when the cap is reached. Admins are exempt — they
-- always get true and are NOT counted.

create or replace function rpc_help_chat_increment(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today  date := (now() at time zone 'utc')::date;
  v_count  int;
  v_limit  constant int := 30;
  v_caller uuid := auth.uid();
begin
  -- Caller must match the user being incremented (or be an admin acting on behalf).
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  if v_caller <> p_user_id and not has_staff_role('admin') then
    raise exception 'forbidden';
  end if;

  -- Admins exempt.
  if has_staff_role('admin') then
    return true;
  end if;

  insert into help_chat_rate_limit (user_id, day, count)
    values (p_user_id, v_today, 1)
  on conflict (user_id, day)
    do update set count = help_chat_rate_limit.count + 1
    returning count into v_count;

  return v_count <= v_limit;
end
$$;

revoke all on function rpc_help_chat_increment(uuid) from public;
grant execute on function rpc_help_chat_increment(uuid) to authenticated;
