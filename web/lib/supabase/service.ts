import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. NEVER expose this to a browser. Use only in
 * server-only code where bypassing RLS is intentional (cron, webhooks, seed).
 *
 * Key rotation procedure: RUNBOOK.md § Day-2 ops → Rotating Service Role Key.
 */
export function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set; refusing to create service client");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
