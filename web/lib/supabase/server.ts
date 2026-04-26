import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for RSC and server actions. Uses anon key + the
 * caller's session cookies, so RLS is enforced.
 *
 * Untyped at the client boundary — supabase-js's strict insert/update typing
 * is too restrictive for our patterns. Per-query types come from
 * `lib/supabase/database.types.ts` where the call site benefits from them.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (entries: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            for (const { name, value, options } of entries) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // The middleware will refresh tokens on the next request.
          }
        },
      },
    },
  );
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
