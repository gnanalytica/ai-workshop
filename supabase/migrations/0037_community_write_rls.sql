-- Align community_posts / community_replies RLS with auth_caps: anyone with
-- community.write for the cohort (enrolled, faculty, etc.) can post, not only
-- is_enrolled_in. Also grant community.read/write to scoped admin/trainer/tech
-- so UI gates and RLS match the role matrix. Replace community_votes policies
-- so vote totals are readable to anyone who can read the thread, while writes
-- require can_write_community (enrolled or community.write).

create or replace function can_write_community(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select is_enrolled_in(p_cohort) or has_cap('community.write', p_cohort)
$$;

grant execute on function can_write_community(uuid) to authenticated;

drop policy if exists cp_self_write on community_posts;
create policy cp_self_write on community_posts
  for insert with check (
    author_id = auth.uid() and can_write_community(cohort_id)
  );

drop policy if exists cr_self_write on community_replies;
create policy cr_self_write on community_replies
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1
        from community_posts p
       where p.id = community_replies.post_id
         and p.deleted_at is null
         and can_write_community(p.cohort_id)
    )
  );

-- Vote visibility: any reader of the post thread can see scores (for UI lists).
drop policy if exists cv_self on community_votes;
create policy cv_read on community_votes
  for select using (
    exists (
      select 1 from community_posts p
      where p.id = community_votes.post_id
        and p.deleted_at is null
        and (is_enrolled_in(p.cohort_id) or has_cap('content.read', p.cohort_id))
    )
    or exists (
      select 1
        from community_replies r
        join community_posts p on p.id = r.post_id
       where r.id = community_votes.reply_id
         and r.deleted_at is null
         and p.deleted_at is null
         and (is_enrolled_in(p.cohort_id) or has_cap('content.read', p.cohort_id))
    )
  );

create policy cv_insert on community_votes
  for insert with check (
    user_id = auth.uid()
    and value in (-1, 1)
    and (
      (
        post_id is not null
        and reply_id is null
        and exists (
          select 1 from community_posts p
          where p.id = community_votes.post_id
            and p.deleted_at is null
            and can_write_community(p.cohort_id)
        )
      )
      or (
        reply_id is not null
        and post_id is null
        and exists (
          select 1
            from community_replies r
            join community_posts p on p.id = r.post_id
           where r.id = community_votes.reply_id
             and r.deleted_at is null
             and p.deleted_at is null
             and can_write_community(p.cohort_id)
        )
      )
    )
  );

create policy cv_update on community_votes
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and value in (-1, 1)
    and (
      (
        post_id is not null
        and reply_id is null
        and exists (
          select 1 from community_posts p
          where p.id = community_votes.post_id
            and p.deleted_at is null
            and can_write_community(p.cohort_id)
        )
      )
      or (
        reply_id is not null
        and post_id is null
        and exists (
          select 1
            from community_replies r
            join community_posts p on p.id = r.post_id
           where r.id = community_votes.reply_id
             and r.deleted_at is null
             and p.deleted_at is null
             and can_write_community(p.cohort_id)
        )
      )
    )
  );

create policy cv_delete on community_votes
  for delete
  using (user_id = auth.uid());

-- Add community.* for Gnanalytica staff when a cohort is in scope (matches
-- product matrix: post/reply on board for admin, trainer, tech).
create or replace function auth_caps(p_cohort uuid default null)
returns text[]
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  caps text[] := array[]::text[];
  is_admin       boolean := has_staff_role('admin');
  is_trainer     boolean := has_staff_role('trainer');
  is_tech_supp   boolean := has_staff_role('tech_support');
  is_faculty     boolean;
  enrolled       boolean;
begin
  if auth.uid() is null then
    return caps;
  end if;

  if is_admin then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read','roster.write',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'analytics.read:cohort','analytics.read:program',
      'moderation.write',
      'support.triage','support.tech_only','support.escalate',
      'orgs.write'
    ];
  end if;

  if is_trainer then
    caps := caps || array[
      'content.read','content.write',
      'schedule.read','schedule.write',
      'roster.read',
      'pods.write','faculty.write',
      'grading.read','grading.write:cohort',
      'analytics.read:cohort',
      'support.triage','support.escalate'
    ];
  end if;

  if is_tech_supp then
    caps := caps || array[
      'content.read','schedule.read','roster.read',
      'support.triage','support.tech_only','support.escalate',
      'moderation.write'
    ];
  end if;

  if p_cohort is not null then
    if is_admin or is_trainer or is_tech_supp then
      caps := caps || array['community.read','community.write'];
    end if;

    is_faculty := exists (
      select 1 from cohort_faculty
       where cohort_id = p_cohort and user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := is_enrolled_in(p_cohort);
    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  else
    is_faculty := exists (
      select 1 from cohort_faculty where user_id = auth.uid()
    );

    if is_faculty then
      caps := caps || array[
        'content.read','schedule.read','roster.read',
        'pods.write',
        'grading.read','grading.write:pod',
        'support.triage','support.escalate',
        'moderation.write',
        'community.read','community.write'
      ];
    end if;

    enrolled := exists (
      select 1 from registrations
       where user_id = auth.uid() and status = 'confirmed'
    );

    if enrolled then
      caps := caps || array[
        'content.read','schedule.read',
        'self.read','self.write',
        'community.read','community.write',
        'attendance.self'
      ];
    end if;
  end if;

  return (select array_agg(distinct c) from unnest(caps) c);
end
$$;

grant execute on function auth_caps(uuid) to authenticated;
