// supabase/functions/auto-close-polls
//
// Cron-invoked every minute by 0069_cron_auto_close_polls.sql. Closes any
// poll whose `closes_at` deadline has passed but whose `closed_at` is still
// null — sets `closed_at = now()` so the audit trail shows the actual close
// timestamp. Idempotent and bounded by the polls_cohort_active_idx index
// from migration 0068.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SHARED_SECRET = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  // Match the X-Shared-Secret convention used by 0011_cron_daily_digest.sql.
  if (SHARED_SECRET && req.headers.get("x-shared-secret") !== SHARED_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sb = adminClient();
  const { data, error } = await sb
    .from("polls")
    .update({ closed_at: new Date().toISOString() })
    .is("closed_at", null)
    .lt("closes_at", new Date().toISOString())
    .select("id");

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, closed: data?.length ?? 0, ids: (data ?? []).map((r) => r.id) }),
    { headers: { "Content-Type": "application/json" } },
  );
});
