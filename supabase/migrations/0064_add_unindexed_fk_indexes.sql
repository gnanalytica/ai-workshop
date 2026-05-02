-- 0064_add_unindexed_fk_indexes.sql
--
-- Add btree indexes on every public-schema FK column missing one.
-- 37 indexes — pure additive change. ON DELETE CASCADE FKs without an
-- index force a sequential scan on every cascade; under load with 150
-- students this compounds. Source: advisor unindexed_foreign_keys.
--
-- Uses CONCURRENTLY where possible? Not inside a migration block.
-- These tables are small at launch so plain CREATE INDEX is fine.

create index if not exists announcements_created_by_idx           on public.announcements(created_by);
create index if not exists assignments_rubric_id_idx              on public.assignments(rubric_id);
create index if not exists attendance_marked_by_idx               on public.attendance(marked_by);
create index if not exists attendance_user_id_idx                 on public.attendance(user_id);
create index if not exists capstone_projects_user_id_idx          on public.capstone_projects(user_id);
create index if not exists capstones_owner_user_id_idx            on public.capstones(owner_user_id);
create index if not exists community_posts_author_id_idx          on public.community_posts(author_id);
create index if not exists community_replies_author_id_idx        on public.community_replies(author_id);
create index if not exists community_replies_post_id_idx          on public.community_replies(post_id);
create index if not exists community_votes_post_id_idx            on public.community_votes(post_id);
create index if not exists community_votes_reply_id_idx           on public.community_votes(reply_id);
create index if not exists day_comments_parent_id_idx             on public.day_comments(parent_id);
create index if not exists day_comments_user_id_idx               on public.day_comments(user_id);
create index if not exists faculty_pod_notes_author_id_idx        on public.faculty_pod_notes(author_id);
create index if not exists faculty_pod_notes_student_id_idx       on public.faculty_pod_notes(student_id);
create index if not exists fpp_cohort_id_idx                      on public.faculty_pretraining_progress(cohort_id);
create index if not exists fpp_module_id_idx                      on public.faculty_pretraining_progress(module_id);
create index if not exists help_desk_queue_claimed_by_idx         on public.help_desk_queue(claimed_by);
create index if not exists help_desk_queue_escalated_by_idx       on public.help_desk_queue(escalated_by);
create index if not exists help_desk_queue_user_id_idx            on public.help_desk_queue(user_id);
create index if not exists invites_cohort_id_idx                  on public.invites(cohort_id);
create index if not exists invites_created_by_idx                 on public.invites(created_by);
create index if not exists kudos_from_user_id_idx                 on public.kudos(from_user_id);
create index if not exists pod_events_actor_user_id_idx           on public.pod_events(actor_user_id);
create index if not exists pod_faculty_cohort_id_idx              on public.pod_faculty(cohort_id);
create index if not exists pod_members_student_user_id_idx        on public.pod_members(student_user_id);
create index if not exists poll_votes_user_id_idx                 on public.poll_votes(user_id);
create index if not exists polls_cohort_id_idx                    on public.polls(cohort_id);
create index if not exists polls_created_by_idx                   on public.polls(created_by);
create index if not exists promo_codes_organization_id_idx        on public.promo_codes(organization_id);
create index if not exists quiz_attempts_user_id_idx              on public.quiz_attempts(user_id);
create index if not exists quizzes_cohort_id_idx                  on public.quizzes(cohort_id);
create index if not exists registrations_promo_code_idx           on public.registrations(promo_code);
create index if not exists submissions_graded_by_idx              on public.submissions(graded_by);
create index if not exists submissions_human_reviewer_id_idx      on public.submissions(human_reviewer_id);
create index if not exists team_members_user_id_idx               on public.team_members(user_id);
create index if not exists teams_created_by_idx                   on public.teams(created_by);
