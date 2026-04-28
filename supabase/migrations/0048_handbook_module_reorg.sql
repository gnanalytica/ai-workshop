-- =============================================================================
-- 0048_handbook_module_reorg.sql  (depends on 0047 for the new enum value)
--   - Drop the obsolete "Observing Grades (You Don't Grade)" module.
--   - Move platform-tour & platform_faculty to dashboard_nav.
--   - Renumber duplicate ordinals so the handbook lists in a stable order.
-- =============================================================================

-- 1. Drop the stale "you don't grade" module (faculty grade pod-scoped now).
delete from faculty_pretraining_modules where slug = 'observing-grades';

-- Drop the old "Platform Tour" written walkthrough — the interactive guide
-- replaces it. The longer "platform_faculty" reference module survives below.
delete from faculty_pretraining_modules where slug = 'platform-tour';

-- 2. Move the workspace reference under the new dashboard_nav category.
update faculty_pretraining_modules
   set category = 'dashboard_nav', ordinal = 1
 where slug = 'platform_faculty';

-- 3. Renumber the technical category to fix the duplicate ordinal=7.
update faculty_pretraining_modules set ordinal = 1 where slug = 'lab-setup-and-day-zero';
update faculty_pretraining_modules set ordinal = 2 where slug = 'lab_environment';

-- 4. Renumber non_technical to fill the hole left by removing observing-grades.
update faculty_pretraining_modules set ordinal = 1 where slug = 'your-role-as-faculty';
update faculty_pretraining_modules set ordinal = 2 where slug = 'daily-rhythm';
update faculty_pretraining_modules set ordinal = 3 where slug = 'pod-checkins-and-notes';
update faculty_pretraining_modules set ordinal = 4 where slug = 'help-desk-and-escalations';
update faculty_pretraining_modules set ordinal = 5 where slug = 'community-moderation';

-- 5. Renumber day_by_day so it starts from 1.
update faculty_pretraining_modules set ordinal = 1 where slug = 'coaching-foundations-d1-d2';
update faculty_pretraining_modules set ordinal = 2 where slug = 'coaching-prompting-d3';
update faculty_pretraining_modules set ordinal = 3 where slug = 'coaching-open-source-and-indian-stack-d4';
update faculty_pretraining_modules set ordinal = 4 where slug = 'coaching-grounded-research-d5';
update faculty_pretraining_modules set ordinal = 5 where slug = 'coaching-the-capstone-d6-d10';
