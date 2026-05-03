import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// How close to access-token expiry we trigger a real refresh round-trip.
// Inside this window we fall through to getUser() so the refresh-token
// flow runs and the cookie is rewritten. Outside it we short-circuit on
// the locally-verified JWT and skip the Supabase Auth call entirely.
const REFRESH_WINDOW_S = 5 * 60;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (entries: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value } of entries) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of entries) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Fast path: verify the JWT locally. If it's valid and not within the
  // refresh window, skip the Auth round-trip entirely. This is the
  // ~80–120ms latency floor we used to pay on every navigation.
  const { data: claimsData } = await supabase.auth.getClaims();
  const exp = claimsData?.claims?.exp as number | undefined;
  const nowS = Math.floor(Date.now() / 1000);
  const needsRefresh =
    !claimsData?.claims || typeof exp !== "number" || exp - nowS < REFRESH_WINDOW_S;

  if (needsRefresh) {
    // IMPORTANT: do not put logic between createServerClient and getUser —
    // it refreshes the session and writes the new cookies onto `response`
    // via the setAll callback above.
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: [
    // Skip session refresh for high-frequency read-only API routes hit by
    // background components (PollPopup, BannerStrip). These only read user
    // state via the existing cookie; if it expires they fall back to null
    // and the next user navigation re-arms the session.
    "/((?!_next/static|_next/image|favicon.ico|api/active-poll|api/active-banner|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
