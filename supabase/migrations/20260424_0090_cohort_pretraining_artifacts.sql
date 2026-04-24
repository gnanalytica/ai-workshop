-- Per-cohort pre-training live-session artifacts. Applied 2026-04-24 via MCP.
-- Admin edits on admin-faculty.html; faculty-guide.html reads.

alter table public.cohorts
  add column if not exists pretraining_slides_url text,
  add column if not exists pretraining_recording_url text,
  add column if not exists pretraining_session_at timestamptz,
  add column if not exists pretraining_notes text;
