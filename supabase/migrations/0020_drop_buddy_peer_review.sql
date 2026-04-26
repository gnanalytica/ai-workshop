-- =============================================================================
-- 0020_drop_buddy_peer_review.sql -- Remove the buddy + peer-review systems.
-- Pods + faculty grading cover the same social/accountability ground for a
-- 30-day cohort; these tables added complexity without payoff.
-- =============================================================================

drop function if exists rpc_generate_buddy_pairs(uuid, int);

drop table if exists buddy_checkins;
drop table if exists buddy_pairs;
drop type  if exists buddy_checkin_kind;

drop table if exists peer_reviews;
drop type  if exists peer_review_status;
