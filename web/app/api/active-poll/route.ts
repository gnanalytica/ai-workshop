import { NextResponse } from "next/server";
import { getActivePoll } from "@/lib/queries/polls";

// Per-user (RLS-bound + my_choice) → `private`. Short TTL so repeat page
// nav within the window is served from the browser cache. Realtime
// broadcasts drive fresh reads via `cache: "reload"` on the client side.
const CACHE_HEADER = "private, max-age=10, stale-while-revalidate=30";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohortId");
  if (!cohortId) {
    return NextResponse.json(
      { poll: null },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  }
  try {
    const poll = await getActivePoll(cohortId);
    return NextResponse.json(
      { poll },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  } catch {
    return NextResponse.json(
      { poll: null },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  }
}
