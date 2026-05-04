import { NextResponse } from "next/server";
import { getActiveBanner } from "@/lib/queries/banners";

// Per-user (RLS-bound) → `private`. Short TTL so repeat page nav within the
// window is served from the browser cache. Realtime broadcasts drive fresh
// reads via `cache: "reload"` on the client side.
const CACHE_HEADER = "private, max-age=15, stale-while-revalidate=60";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohortId");
  if (!cohortId) {
    return NextResponse.json(
      { banner: null },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  }
  try {
    const banner = await getActiveBanner(cohortId);
    return NextResponse.json(
      { banner },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  } catch {
    return NextResponse.json(
      { banner: null },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  }
}
