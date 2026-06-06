import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unauthenticated routes
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/start") ||
    pathname.startsWith("/auth") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Make the current pathname readable from RSCs via headers().get("x-pathname").
  // Layouts don't get URL params, so this is the cleanest way for the auth shell
  // to know which admin-cohort page the user is on.
  request.headers.set("x-pathname", pathname);
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

  // IMPORTANT: do not put any logic between createServerClient and the
  // session-refresh call — it writes the new cookies onto `response`.
  //
  // Uses getSession() (cookie-only, no DB roundtrip) rather than getUser().
  // The old call hit auth.users/sessions/identities/mfa_factors on every
  // request — pg_stat_statements showed ~1.4M chained queries saturating
  // the pool during class peaks. The downstream PostgREST call still
  // verifies the JWT signature, so RLS protection is unchanged.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check for missing roll_number on confirmed students
  if (session && pathname !== "/start/roll-number") {
    const { data: registration } = await supabase
      .from("registrations")
      .select("roll_number")
      .eq("user_id", session.user.id)
      .eq("status", "confirmed")
      .maybeSingle();

    if (registration && !registration.roll_number) {
      return NextResponse.redirect(new URL("/start/roll-number", request.url));
    }
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
