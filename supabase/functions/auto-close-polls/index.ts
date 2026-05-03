// supabase/functions/auto-close-polls
//
// Cron-invoked every minute by 0069_cron_auto_close_polls.sql. Closes any
// poll whose `closes_at` deadline has passed but whose `closed_at` is still
// null — sets `closed_at = now()` so the audit trail shows the actual close
// timestamp. Idempotent and bounded by the polls_cohort_active_idx index
// from migration 0068.
//
// After closing, broadcasts `poll` on each affected `cohort:<id>` topic so
// clients update without needing a fallback poll. Mirrors the same Realtime
// HTTP broadcast endpoint used by web/lib/realtime/broadcast.ts.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SHARED_SECRET = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function broadcastPoll(cohortIds: string[]) {
  if (cohortIds.length === 0) return;
  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
      body: JSON.stringify({
        messages: cohortIds.map((id) => ({
          topic: `cohort:${id}`,
          event: "poll",
          payload: {},
        })),
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Best-effort. Rows are already closed; the next vote/create/close on
    // the cohort will broadcast and bring lagging clients back in sync.
  }
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
    .select("id, cohort_id");

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = (data ?? []) as Array<{ id: string; cohort_id: string }>;
  const cohortIds = Array.from(new Set(rows.map((r) => r.cohort_id)));
  await broadcastPoll(cohortIds);

  return new Response(
    JSON.stringify({ ok: true, closed: rows.length, ids: rows.map((r) => r.id) }),
    { headers: { "Content-Type": "application/json" } },
  );
});
