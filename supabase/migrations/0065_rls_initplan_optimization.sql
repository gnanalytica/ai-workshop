-- 0065_rls_initplan_optimization.sql
--
-- Replace `auth.uid()` with `(select auth.uid())` in 54 RLS policies.
-- The bare call re-evaluates per row; wrapping it as a subselect lets
-- the planner hoist it to an InitPlan computed once per query.
-- Source: advisor `auth_rls_initplan`. Per-policy logic preserved
-- exactly; only the auth.uid() reference is changed.
--
-- Pattern: drop policy if exists + create policy (same name, same
-- semantics).

-- =============================================================================
-- attendance
-- =============================================================================
drop policy if exists att_self_attend on public.attendance;
create policy att_self_attend on public.attendance
  for insert to authenticated
  with check ((user_id = (select auth.uid())) and has_cap('attendance.self', cohort_id));

drop policy if exists att_self_read on public.attendance;
create policy att_self_read on public.attendance
  for select to authenticated
  using ((user_id = (select auth.uid())) or has_cap('grading.read', cohort_id));

-- =============================================================================
-- capstone_projects
-- =============================================================================
drop policy if exists cap_self on public.capstone_projects;
create policy cap_self on public.capstone_projects
  for select to authenticated
  using ((user_id = (select auth.uid())) and is_enrolled_in(cohort_id));

drop policy if exists cap_self_update on public.capstone_projects;
create policy cap_self_update on public.capstone_projects
  for update to authenticated
  using ((user_id = (select auth.uid())) and is_enrolled_in(cohort_id))
  with check ((user_id = (select auth.uid())) and is_enrolled_in(cohort_id));

drop policy if exists cap_self_write on public.capstone_projects;
create policy cap_self_write on public.capstone_projects
  for insert to authenticated
  with check ((user_id = (select auth.uid())) and is_enrolled_in(cohort_id));

-- =============================================================================
-- capstones
-- =============================================================================
drop policy if exists cap_read on public.capstones;
create policy cap_read on public.capstones
  for select to authenticated
  using ((owner_user_id = (select auth.uid())) or is_public or has_cap('grading.read', cohort_id));

drop policy if exists cap_self_write on public.capstones;
create policy cap_self_write on public.capstones
  for all to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

-- =============================================================================
-- cohort_faculty
-- =============================================================================
drop policy if exists cf_read on public.cohort_faculty;
create policy cf_read on public.cohort_faculty
  for select to authenticated
  using (
    (user_id = (select auth.uid()))
    or has_cap('roster.read', cohort_id)
    or _is_cohort_faculty(cohort_id)
  );

-- =============================================================================
-- cohorts
-- =============================================================================
drop policy if exists cohorts_read on public.cohorts;
create policy cohorts_read on public.cohorts
  for select to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from cohort_faculty f
      where f.cohort_id = cohorts.id and f.user_id = (select auth.uid())
    )
    or exists (
      select 1 from registrations r
      where r.cohort_id = cohorts.id and r.user_id = (select auth.uid())
    )
    or status = 'live'::cohort_status
  );

-- =============================================================================
-- community_posts
-- =============================================================================
drop policy if exists cp_self_update on public.community_posts;
create policy cp_self_update on public.community_posts
  for update to authenticated
  using ((author_id = (select auth.uid())) and (deleted_at is null))
  with check (author_id = (select auth.uid()));

drop policy if exists cp_self_write on public.community_posts;
create policy cp_self_write on public.community_posts
  for insert to authenticated
  with check ((author_id = (select auth.uid())) and can_write_community(cohort_id));

-- =============================================================================
-- community_replies
-- =============================================================================
drop policy if exists cr_self_update on public.community_replies;
create policy cr_self_update on public.community_replies
  for update to authenticated
  using ((author_id = (select auth.uid())) and (deleted_at is null))
  with check (author_id = (select auth.uid()));

drop policy if exists cr_self_write on public.community_replies;
create policy cr_self_write on public.community_replies
  for insert to authenticated
  with check (
    (author_id = (select auth.uid()))
    and exists (
      select 1 from community_posts p
      where p.id = community_replies.post_id
        and p.deleted_at is null
        and can_write_community(p.cohort_id)
    )
  );

-- =============================================================================
-- community_votes
-- =============================================================================
drop policy if exists cv_delete on public.community_votes;
create policy cv_delete on public.community_votes
  for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists cv_insert on public.community_votes;
create policy cv_insert on public.community_votes
  for insert to authenticated
  with check (
    (user_id = (select auth.uid()))
    and (value = any (array[-1, 1]))
    and (
      (post_id is not null and reply_id is null and exists (
        select 1 from community_posts p
        where p.id = community_votes.post_id
          and p.deleted_at is null
          and can_write_community(p.cohort_id)
      ))
      or (reply_id is not null and post_id is null and exists (
        select 1 from community_replies r
        join community_posts p on p.id = r.post_id
        where r.id = community_votes.reply_id
          and r.deleted_at is null
          and p.deleted_at is null
          and can_write_community(p.cohort_id)
      ))
    )
  );

drop policy if exists cv_update on public.community_votes;
create policy cv_update on public.community_votes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    (user_id = (select auth.uid()))
    and (value = any (array[-1, 1]))
    and (
      (post_id is not null and reply_id is null and exists (
        select 1 from community_posts p
        where p.id = community_votes.post_id
          and p.deleted_at is null
          and can_write_community(p.cohort_id)
      ))
      or (reply_id is not null and post_id is null and exists (
        select 1 from community_replies r
        join community_posts p on p.id = r.post_id
        where r.id = community_votes.reply_id
          and r.deleted_at is null
          and p.deleted_at is null
          and can_write_community(p.cohort_id)
      ))
    )
  );

-- =============================================================================
-- day_comments
-- =============================================================================
drop policy if exists dc_self_update on public.day_comments;
create policy dc_self_update on public.day_comments
  for update to authenticated
  using ((user_id = (select auth.uid())) and (deleted_at is null))
  with check (user_id = (select auth.uid()));

drop policy if exists dc_self_write on public.day_comments;
create policy dc_self_write on public.day_comments
  for insert to authenticated
  with check ((user_id = (select auth.uid())) and is_enrolled_in(cohort_id));

-- =============================================================================
-- faculty_pod_notes  (NOTE: fpn_write USING(true) is tracked separately)
-- =============================================================================
drop policy if exists fpn_delete on public.faculty_pod_notes;
create policy fpn_delete on public.faculty_pod_notes
  for delete to authenticated
  using ((author_id = (select auth.uid())) or has_staff_role('admin'));

drop policy if exists fpn_read on public.faculty_pod_notes;
create policy fpn_read on public.faculty_pod_notes
  for select to authenticated
  using (
    has_staff_role('admin')
    or (
      has_cap('roster.read', cohort_id)
      and exists (
        select 1 from cohort_faculty cf
        where cf.cohort_id = faculty_pod_notes.cohort_id
          and cf.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists fpn_update on public.faculty_pod_notes;
create policy fpn_update on public.faculty_pod_notes
  for update to authenticated
  using ((author_id = (select auth.uid())) or has_staff_role('admin'));

drop policy if exists fpn_write on public.faculty_pod_notes;
create policy fpn_write on public.faculty_pod_notes
  for all to authenticated
  using (true)
  with check (
    (author_id = (select auth.uid()))
    and (
      has_staff_role('admin')
      or exists (
        select 1 from cohort_faculty cf
        where cf.cohort_id = faculty_pod_notes.cohort_id
          and cf.user_id = (select auth.uid())
      )
    )
  );

-- =============================================================================
-- faculty_pretraining_modules
-- =============================================================================
drop policy if exists fpm_read on public.faculty_pretraining_modules;
create policy fpm_read on public.faculty_pretraining_modules
  for select to authenticated
  using ((select auth.uid()) is not null);

-- =============================================================================
-- faculty_pretraining_progress
-- =============================================================================
drop policy if exists fpp_self on public.faculty_pretraining_progress;
create policy fpp_self on public.faculty_pretraining_progress
  for all to authenticated
  using (faculty_user_id = (select auth.uid()))
  with check (faculty_user_id = (select auth.uid()));

-- =============================================================================
-- help_chat_conversations
-- =============================================================================
drop policy if exists help_chat_conv_owner_delete on public.help_chat_conversations;
create policy help_chat_conv_owner_delete on public.help_chat_conversations
  for delete to authenticated
  using ((user_id = (select auth.uid())) or has_staff_role('admin'));

drop policy if exists help_chat_conv_owner_insert on public.help_chat_conversations;
create policy help_chat_conv_owner_insert on public.help_chat_conversations
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists help_chat_conv_owner_select on public.help_chat_conversations;
create policy help_chat_conv_owner_select on public.help_chat_conversations
  for select to authenticated
  using ((user_id = (select auth.uid())) or has_staff_role('admin'));

drop policy if exists help_chat_conv_owner_update on public.help_chat_conversations;
create policy help_chat_conv_owner_update on public.help_chat_conversations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- help_chat_messages
-- =============================================================================
drop policy if exists help_chat_msg_owner_delete on public.help_chat_messages;
create policy help_chat_msg_owner_delete on public.help_chat_messages
  for delete to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists help_chat_msg_owner_insert on public.help_chat_messages;
create policy help_chat_msg_owner_insert on public.help_chat_messages
  for insert to authenticated
  with check (
    exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists help_chat_msg_owner_select on public.help_chat_messages;
create policy help_chat_msg_owner_select on public.help_chat_messages
  for select to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from help_chat_conversations c
      where c.id = help_chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- help_desk_queue
-- =============================================================================
drop policy if exists hdq_self on public.help_desk_queue;
create policy hdq_self on public.help_desk_queue
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- kudos
-- =============================================================================
drop policy if exists kudos_self_delete on public.kudos;
create policy kudos_self_delete on public.kudos
  for delete to authenticated
  using ((from_user_id = (select auth.uid())) or has_cap('moderation.write'));

drop policy if exists kudos_self_write on public.kudos;
create policy kudos_self_write on public.kudos
  for insert to authenticated
  with check ((from_user_id = (select auth.uid())) and is_enrolled_in(cohort_id));

-- =============================================================================
-- lab_progress
-- =============================================================================
drop policy if exists lp_self on public.lab_progress;
create policy lp_self on public.lab_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- notifications_log
-- =============================================================================
drop policy if exists notif_admin on public.notifications_log;
create policy notif_admin on public.notifications_log
  for select to authenticated
  using (has_staff_role('admin') or (user_id = (select auth.uid())));

-- =============================================================================
-- pod_faculty
-- =============================================================================
drop policy if exists pf_read on public.pod_faculty;
create policy pf_read on public.pod_faculty
  for select to authenticated
  using (
    (faculty_user_id = (select auth.uid()))
    or exists (
      select 1 from pods p
      where p.id = pod_faculty.pod_id
        and (has_cap('roster.read', p.cohort_id) or is_enrolled_in(p.cohort_id))
    )
  );

-- =============================================================================
-- pod_members
-- =============================================================================
drop policy if exists pm_read on public.pod_members;
create policy pm_read on public.pod_members
  for select to authenticated
  using (
    (student_user_id = (select auth.uid()))
    or has_cap('roster.read', cohort_id)
    or exists (
      select 1 from pod_faculty f
      where f.pod_id = pod_members.pod_id
        and f.faculty_user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- poll_votes
-- =============================================================================
drop policy if exists pv_self on public.poll_votes;
create policy pv_self on public.poll_votes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- profiles
-- =============================================================================
drop policy if exists profiles_cofaculty_read on public.profiles;
create policy profiles_cofaculty_read on public.profiles
  for select to authenticated
  using (
    exists (
      select 1
      from cohort_faculty me
      join cohort_faculty other on other.cohort_id = me.cohort_id
      where me.user_id = (select auth.uid())
        and other.user_id = profiles.id
    )
  );

drop policy if exists profiles_faculty_read on public.profiles;
create policy profiles_faculty_read on public.profiles
  for select to authenticated
  using (
    exists (
      select 1
      from cohort_faculty cf
      join registrations r on r.cohort_id = cf.cohort_id
      where cf.user_id = (select auth.uid())
        and r.user_id = profiles.id
    )
  );

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- =============================================================================
-- quiz_attempts
-- =============================================================================
drop policy if exists qa_self on public.quiz_attempts;
create policy qa_self on public.quiz_attempts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- registrations
-- =============================================================================
drop policy if exists reg_self_create on public.registrations;
create policy reg_self_create on public.registrations
  for insert to authenticated
  with check ((user_id = (select auth.uid())) and (status = 'pending'::registration_status));

drop policy if exists reg_self_read on public.registrations;
create policy reg_self_read on public.registrations
  for select to authenticated
  using (user_id = (select auth.uid()));

-- =============================================================================
-- rubric_templates
-- =============================================================================
drop policy if exists rubric_read on public.rubric_templates;
create policy rubric_read on public.rubric_templates
  for select to authenticated
  using (
    has_staff_role('admin')
    or exists (
      select 1 from cohort_faculty
      where cohort_faculty.user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- submissions
-- =============================================================================
drop policy if exists subs_self on public.submissions;
create policy subs_self on public.submissions
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists subs_self_update on public.submissions;
create policy subs_self_update on public.submissions
  for update to authenticated
  using ((user_id = (select auth.uid())) and (status = any (array['draft'::submission_status, 'submitted'::submission_status])))
  with check ((user_id = (select auth.uid())) and (status = any (array['draft'::submission_status, 'submitted'::submission_status])));

drop policy if exists subs_self_write on public.submissions;
create policy subs_self_write on public.submissions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- team_members
-- =============================================================================
drop policy if exists tm_read on public.team_members;
create policy tm_read on public.team_members
  for select to authenticated
  using (
    (user_id = (select auth.uid()))
    or exists (
      select 1 from teams t
      where t.id = team_members.team_id and is_enrolled_in(t.cohort_id)
    )
    or exists (
      select 1 from teams t
      where t.id = team_members.team_id and has_cap('roster.read', t.cohort_id)
    )
  );

drop policy if exists tm_self on public.team_members;
create policy tm_self on public.team_members
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =============================================================================
-- teams
-- =============================================================================
drop policy if exists teams_create on public.teams;
create policy teams_create on public.teams
  for insert to authenticated
  with check (is_enrolled_in(cohort_id) and (created_by = (select auth.uid())));

drop policy if exists teams_self_update on public.teams;
create policy teams_self_update on public.teams
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
