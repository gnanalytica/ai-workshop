import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://qvqlpcnvculkrjpkdrwi.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_7XyW7RHJ28PBk_1HD1FsbQ_LIbvkJUY';
export const COHORT_SLUG = 'cohort-01';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
