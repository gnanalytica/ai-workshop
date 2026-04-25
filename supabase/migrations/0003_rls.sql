-- =============================================================================
-- 0003_rls.sql  --  Row-level security policies. Every rule routes through
-- has_cap() / has_staff_role() / shares_pod_with() / can_grade() helpers.
-- =============================================================================

-- ----- profiles ---------------------------------------------------------------

drop policy if exists profiles_self_read on profiles;
create policy profiles_self_read on profiles
  for select using (id = auth.uid());

drop policy if exists profiles_staff_read on profiles;
create policy profiles_staff_read on profiles
  for select using (
    has_staff_role('admin') or has_staff_role('trainer') or has_staff_role('tech_support')
  );

drop policy if exists profiles_faculty_read on profiles;
create policy profiles_faculty_read on profiles
  for select using (
    -- Faculty can see profiles of co-cohort members
    exists (
      select 1
        from cohort_faculty cf
        join registrations r on r.cohort_id = cf.cohort_id
       where cf.user_id = auth.uid() and r.user_id = profiles.id
    )
  );

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles
  for all using (has_staff_role('admin')) with check (has_staff_role('admin'));

-- ----- cohorts ----------------------------------------------------------------

drop policy if exists cohorts_read on cohorts;
create policy cohorts_read on cohorts
  for select using (
    has_staff_role('admin') or has_staff_role('trainer') or has_staff_role('tech_support')
    or exists (select 1 from cohort_faculty f where f.cohort_id = cohorts.id and f.user_id = auth.uid())
    or exists (select 1 from registrations r where r.cohort_id = cohorts.id and r.user_id = auth.uid())
    or status = 'live'
  );

drop policy if exists cohorts_admin_write on cohorts;
create policy cohorts_admin_write on cohorts
  for all using (has_cap('schedule.write')) with check (has_cap('schedule.write'));

-- ----- cohort_days ------------------------------------------------------------

drop policy if exists cohort_days_read on cohort_days;
create policy cohort_days_read on cohort_days
  for select using (has_cap('schedule.read', cohort_id) or has_cap('content.read', cohort_id));

drop policy if exists cohort_days_write on cohort_days;
create policy cohort_days_write on cohort_days
  for all using (has_cap('schedule.write', cohort_id)) with check (has_cap('schedule.write', cohort_id));

-- ----- registrations ----------------------------------------------------------

drop policy if exists reg_self_read on registrations;
create policy reg_self_read on registrations
  for select using (user_id = auth.uid());

drop policy if exists reg_staff_read on registrations;
create policy reg_staff_read on registrations
  for select using (has_cap('roster.read', cohort_id));

drop policy if exists reg_self_create on registrations;
create policy reg_self_create on registrations
  for insert with check (user_id = auth.uid() and status = 'pending');

drop policy if exists reg_staff_write on registrations;
create policy reg_staff_write on registrations
  for all using (has_cap('roster.write', cohort_id)) with check (has_cap('roster.write', cohort_id));

-- ----- cohort_faculty ---------------------------------------------------------

drop policy if exists cf_read on cohort_faculty;
create policy cf_read on cohort_faculty
  for select using (
    user_id = auth.uid()
    or has_cap('roster.read', cohort_id)
    or exists (select 1 from cohort_faculty cf2 where cf2.cohort_id = cohort_faculty.cohort_id and cf2.user_id = auth.uid())
  );

drop policy if exists cf_write on cohort_faculty;
create policy cf_write on cohort_faculty
  for all using (has_cap('faculty.write', cohort_id)) with check (has_cap('faculty.write', cohort_id));

-- ----- day_faculty ------------------------------------------------------------

drop policy if exists df_read on day_faculty;
create policy df_read on day_faculty
  for select using (has_cap('schedule.read', cohort_id));

drop policy if exists df_write on day_faculty;
create policy df_write on day_faculty
  for all using (has_cap('schedule.write', cohort_id)) with check (has_cap('schedule.write', cohort_id));

-- ----- pods + roster ----------------------------------------------------------

drop policy if exists pods_read on pods;
create policy pods_read on pods
  for select using (has_cap('roster.read', cohort_id) or is_enrolled_in(cohort_id));

drop policy if exists pods_write on pods;
create policy pods_write on pods
  for all using (has_cap('pods.write', cohort_id)) with check (has_cap('pods.write', cohort_id));

drop policy if exists pf_read on pod_faculty;
create policy pf_read on pod_faculty
  for select using (
    faculty_user_id = auth.uid()
    or exists (select 1 from pods p where p.id = pod_faculty.pod_id
               and (has_cap('roster.read', p.cohort_id) or is_enrolled_in(p.cohort_id)))
  );

drop policy if exists pf_write on pod_faculty;
create policy pf_write on pod_faculty
  for all using (
    exists (select 1 from pods p where p.id = pod_faculty.pod_id and has_cap('pods.write', p.cohort_id))
  ) with check (
    exists (select 1 from pods p where p.id = pod_faculty.pod_id and has_cap('pods.write', p.cohort_id))
  );

drop policy if exists pm_read on pod_members;
create policy pm_read on pod_members
  for select using (
    student_user_id = auth.uid()
    or has_cap('roster.read', cohort_id)
    or exists (select 1 from pod_faculty f where f.pod_id = pod_members.pod_id and f.faculty_user_id = auth.uid())
  );

drop policy if exists pm_write on pod_members;
create policy pm_write on pod_members
  for all using (has_cap('pods.write', cohort_id)) with check (has_cap('pods.write', cohort_id));

drop policy if exists pe_read on pod_events;
create policy pe_read on pod_events
  for select using (
    exists (select 1 from pods p where p.id = pod_events.pod_id and has_cap('roster.read', p.cohort_id))
  );

drop policy if exists pe_insert on pod_events;
create policy pe_insert on pod_events
  for insert with check (
    exists (select 1 from pods p where p.id = pod_events.pod_id and has_cap('pods.write', p.cohort_id))
  );

-- ----- assignments / submissions / peer_reviews -------------------------------

drop policy if exists assignments_read on assignments;
create policy assignments_read on assignments
  for select using (has_cap('content.read', cohort_id));

drop policy if exists assignments_write on assignments;
create policy assignments_write on assignments
  for all using (has_cap('content.write', cohort_id)) with check (has_cap('content.write', cohort_id));

drop policy if exists subs_self on submissions;
create policy subs_self on submissions
  for select using (user_id = auth.uid());

drop policy if exists subs_self_write on submissions;
create policy subs_self_write on submissions
  for insert with check (user_id = auth.uid());

drop policy if exists subs_self_update on submissions;
create policy subs_self_update on submissions
  for update using (user_id = auth.uid() and status in ('draft','submitted'))
  with check (user_id = auth.uid() and status in ('draft','submitted'));

drop policy if exists subs_grader_read on submissions;
create policy subs_grader_read on submissions
  for select using (can_grade(id) or
    exists (select 1 from assignments a where a.id = submissions.assignment_id
            and has_cap('grading.read', a.cohort_id)));

drop policy if exists subs_grader_write on submissions;
create policy subs_grader_write on submissions
  for update using (can_grade(id)) with check (can_grade(id));

drop policy if exists pr_read on peer_reviews;
create policy pr_read on peer_reviews
  for select using (
    reviewer_id = auth.uid()
    or exists (select 1 from submissions s where s.id = peer_reviews.submission_id
               and (s.user_id = auth.uid() or can_grade(s.id)))
  );

drop policy if exists pr_write on peer_reviews;
create policy pr_write on peer_reviews
  for all using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());

-- ----- quizzes / attempts -----------------------------------------------------

drop policy if exists q_read on quizzes;
create policy q_read on quizzes
  for select using (has_cap('content.read', cohort_id));

drop policy if exists q_write on quizzes;
create policy q_write on quizzes
  for all using (has_cap('content.write', cohort_id)) with check (has_cap('content.write', cohort_id));

drop policy if exists qq_read on quiz_questions;
create policy qq_read on quiz_questions
  for select using (
    exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and has_cap('content.read', q.cohort_id))
  );

drop policy if exists qq_write on quiz_questions;
create policy qq_write on quiz_questions
  for all using (
    exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and has_cap('content.write', q.cohort_id))
  ) with check (
    exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and has_cap('content.write', q.cohort_id))
  );

drop policy if exists qa_self on quiz_attempts;
create policy qa_self on quiz_attempts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists qa_staff_read on quiz_attempts;
create policy qa_staff_read on quiz_attempts
  for select using (
    exists (select 1 from quizzes q where q.id = quiz_attempts.quiz_id and has_cap('grading.read', q.cohort_id))
  );

-- ----- lab progress / attendance / stuck queue -------------------------------

drop policy if exists lp_self on lab_progress;
create policy lp_self on lab_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists lp_staff_read on lab_progress;
create policy lp_staff_read on lab_progress
  for select using (has_cap('grading.read', cohort_id));

drop policy if exists att_self_read on attendance;
create policy att_self_read on attendance
  for select using (user_id = auth.uid() or has_cap('grading.read', cohort_id));

drop policy if exists att_staff_write on attendance;
create policy att_staff_write on attendance
  for all using (
    has_cap('attendance.mark:cohort', cohort_id)
    or (has_cap('attendance.mark:pod', cohort_id) and shares_pod_with(user_id, cohort_id))
  ) with check (
    has_cap('attendance.mark:cohort', cohort_id)
    or (has_cap('attendance.mark:pod', cohort_id) and shares_pod_with(user_id, cohort_id))
  );

drop policy if exists att_self_attend on attendance;
create policy att_self_attend on attendance
  for insert with check (user_id = auth.uid() and has_cap('attendance.self', cohort_id));

drop policy if exists sq_self on stuck_queue;
create policy sq_self on stuck_queue
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists sq_triage on stuck_queue;
create policy sq_triage on stuck_queue
  for all using (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech' or has_cap('support.tech_only'))
  ) with check (
    has_cap('support.triage', cohort_id)
    and (kind <> 'tech' or has_cap('support.tech_only'))
  );

-- ----- announcements + polls --------------------------------------------------

drop policy if exists ann_read on announcements;
create policy ann_read on announcements
  for select using (
    deleted_at is null and (
      is_enrolled_in(cohort_id)
      or has_cap('schedule.read', cohort_id)
      or has_cap('announcements.read:cohort', cohort_id)
    )
  );

drop policy if exists ann_write on announcements;
create policy ann_write on announcements
  for all using (has_cap('announcements.write:cohort', cohort_id))
  with check (has_cap('announcements.write:cohort', cohort_id));

drop policy if exists polls_read on polls;
create policy polls_read on polls
  for select using (
    is_enrolled_in(cohort_id) or has_cap('schedule.read', cohort_id)
  );

drop policy if exists polls_write on polls;
create policy polls_write on polls
  for all using (has_cap('content.write', cohort_id)) with check (has_cap('content.write', cohort_id));

drop policy if exists pv_self on poll_votes;
create policy pv_self on poll_votes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----- board ------------------------------------------------------------------

drop policy if exists bp_read on board_posts;
create policy bp_read on board_posts
  for select using (
    deleted_at is null and (is_enrolled_in(cohort_id) or has_cap('content.read', cohort_id))
  );

drop policy if exists bp_self_write on board_posts;
create policy bp_self_write on board_posts
  for insert with check (author_id = auth.uid() and is_enrolled_in(cohort_id));

drop policy if exists bp_self_update on board_posts;
create policy bp_self_update on board_posts
  for update using (author_id = auth.uid() and deleted_at is null)
  with check (author_id = auth.uid());

drop policy if exists bp_mod on board_posts;
create policy bp_mod on board_posts
  for all using (has_cap('moderation.write')) with check (has_cap('moderation.write'));

drop policy if exists br_read on board_replies;
create policy br_read on board_replies
  for select using (
    deleted_at is null and exists (
      select 1 from board_posts p where p.id = board_replies.post_id
        and (is_enrolled_in(p.cohort_id) or has_cap('content.read', p.cohort_id))
    )
  );

drop policy if exists br_self_write on board_replies;
create policy br_self_write on board_replies
  for insert with check (
    author_id = auth.uid() and exists (
      select 1 from board_posts p where p.id = board_replies.post_id and is_enrolled_in(p.cohort_id)
    )
  );

drop policy if exists br_self_update on board_replies;
create policy br_self_update on board_replies
  for update using (author_id = auth.uid() and deleted_at is null)
  with check (author_id = auth.uid());

drop policy if exists br_mod on board_replies;
create policy br_mod on board_replies
  for all using (has_cap('moderation.write')) with check (has_cap('moderation.write'));

drop policy if exists bv_self on board_votes;
create policy bv_self on board_votes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----- rubric_templates -------------------------------------------------------

drop policy if exists rubric_read on rubric_templates;
create policy rubric_read on rubric_templates for select using (
  has_staff_role('admin') or has_staff_role('trainer')
  or exists (select 1 from cohort_faculty where user_id = auth.uid())
);

drop policy if exists rubric_write on rubric_templates;
create policy rubric_write on rubric_templates for all
  using (has_staff_role('admin') or has_staff_role('trainer'))
  with check (has_staff_role('admin') or has_staff_role('trainer'));

-- ----- notifications + rbac_events (admin-only read; system writes via service role)

drop policy if exists notif_admin on notifications_log;
create policy notif_admin on notifications_log
  for select using (has_staff_role('admin') or user_id = auth.uid());

drop policy if exists rbac_admin on rbac_events;
create policy rbac_admin on rbac_events
  for select using (has_staff_role('admin'));

-- ----- organizations / promo_codes (admin-only) ------------------------------

drop policy if exists orgs_read on organizations;
create policy orgs_read on organizations for select using (true);  -- public-readable for signup

drop policy if exists orgs_write on organizations;
create policy orgs_write on organizations for all
  using (has_cap('orgs.write')) with check (has_cap('orgs.write'));

drop policy if exists promo_read on promo_codes;
create policy promo_read on promo_codes for select using (true);

drop policy if exists promo_write on promo_codes;
create policy promo_write on promo_codes for all
  using (has_cap('orgs.write')) with check (has_cap('orgs.write'));
