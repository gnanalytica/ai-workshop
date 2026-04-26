-- =============================================================================
-- 0024_pr3_faq_mentions.sql -- Curated FAQ flag on board posts and a 'mention'
-- notification kind for @-mentions in board posts/replies.
-- =============================================================================

alter table board_posts
  add column if not exists is_canonical boolean not null default false;

create index if not exists board_posts_canonical_idx
  on board_posts (cohort_id) where is_canonical and deleted_at is null;

alter type notification_kind add value if not exists 'mention';
