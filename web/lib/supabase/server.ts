import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase client for RSC and server actions. Uses anon key + the
 * caller's session cookies, so RLS is enforced.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (entries: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value, options } of entries) {
            cookieStore.set(name, value, options);
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
