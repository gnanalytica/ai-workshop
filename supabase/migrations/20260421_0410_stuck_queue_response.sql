-- Add response so faculty/admins can record a reply when resolving a stuck item.
alter table public.stuck_queue
  add column if not exists response text;
