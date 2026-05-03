-- =============================================================================
-- 0078_normalize_poll_options.sql
--
-- Older polls were seeded with options as bare string arrays
-- (["foo", "bar"]). The popup expects [{id, label}] and renders blank
-- buttons when it sees the legacy shape. Normalize in place — index
-- becomes the id, the original string becomes the label.
-- Idempotent: only rewrites rows that still have a string element.
-- =============================================================================

begin;

update polls
   set options = (
     select coalesce(
       jsonb_agg(
         case
           when jsonb_typeof(elem) = 'string'
             then jsonb_build_object('id', idx::text, 'label', elem #>> '{}')
           else elem
         end
         order by idx
       ),
       '[]'::jsonb
     )
     from jsonb_array_elements(options) with ordinality as t(elem, idx)
   )
 where exists (
   select 1 from jsonb_array_elements(options) e
   where jsonb_typeof(e) = 'string'
 );

commit;
