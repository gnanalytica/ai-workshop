import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Refreshes the Supabase session cookie when it's near expiry, so the
 * downstream RSC pipeline always sees a fresh JWT in cookies without each
 * RSC having to call the Auth API itself.
 *
 * Calls `auth.getSession()` (cookie-only, no DB roundtrip). Supabase-ssr
 * handles automatic refresh of the access token when the refresh token is
 * still valid, writing the new cookie via `setAll`.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (entries: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value } of entries) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of entries) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    /**
     * Run on every request except static assets and Next internals.
     * Cookie refresh on those is wasted work.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js)$).*)",
  ],
};
