import "server-only";

/**
 * Server → Realtime broadcast helper. Uses Supabase Realtime's HTTP send
 * endpoint so we don't need to open a websocket from a serverless function.
 *
 * Topics: `cohort:<uuid>`. Events emitted today: `poll`, `banner`. Payloads
 * are intentionally empty — clients refetch through the existing RLS-bound
 * API route on receipt. The broadcast is a tickle, not a data carrier.
 *
 * Best-effort: failures are swallowed so a Realtime hiccup never breaks a
 * write. Clients still have a slow fallback poll as a safety net.
 */
export async function broadcastToCohort(
  cohortId: string,
  event: "poll" | "banner",
  payload: Record<string, unknown> = {},
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        messages: [{ topic: `cohort:${cohortId}`, event, payload }],
      }),
      // Short timeout — this is fire-and-forget; the user write already
      // succeeded by the time we get here.
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Swallow. Client fallback poll will catch up within 60s.
  }
}
