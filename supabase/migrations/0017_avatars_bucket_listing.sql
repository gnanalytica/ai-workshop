-- =============================================================================
-- 0017_avatars_bucket_listing.sql -- Drop the broad SELECT policy on the
-- public `avatars` bucket. The bucket is public so direct URL access still
-- works (getPublicUrl), but listing/discovering filenames is no longer
-- possible by anonymous clients.
-- =============================================================================

drop policy if exists avatars_read on storage.objects;
