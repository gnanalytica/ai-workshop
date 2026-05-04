-- =============================================================================
-- 0084_cohort_days_slides_url.sql
--
-- Add a per-day slide deck URL to cohort_days so faculty can attach a Google
-- Slides / Gamma / Canva embed link. Visibility gated by the existing
-- is_unlocked flag in app code — no new RLS surface.
-- =============================================================================

alter table public.cohort_days
  add column if not exists slides_url text;
