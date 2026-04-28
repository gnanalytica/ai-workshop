-- Remove hardcoded URL paths from faculty handbook copy.
-- The UI now exposes navigation via tour + action buttons, so prose
-- shouldn't leak pathnames like (`/foo/bar`) inline.

update faculty_pretraining_modules
set body_md = replace(body_md, ' (`/pods`)', '')
where body_md like '% (`/pods`)%';

update faculty_pretraining_modules
set body_md = replace(body_md, ' and `/faculty/day/today`', '')
where body_md like '%`/faculty/day/today`%';

update faculty_pretraining_modules
set body_md = replace(body_md, '**Main Help desk** (`/faculty/help-desk`)', '**Main Help desk**')
where body_md like '%(`/faculty/help-desk`)%';

update faculty_pretraining_modules
set body_md = replace(body_md, '**View resolved** (`/faculty/help-desk/history`)', '**View resolved**')
where body_md like '%(`/faculty/help-desk/history`)%';
