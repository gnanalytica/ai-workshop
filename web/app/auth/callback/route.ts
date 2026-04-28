import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/start`);
  }

  const sb = await getSupabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/start?error=${encodeURIComponent(error.message)}`);
  }

  // /dashboard runs resolveHome() and redirects to /admin, /faculty, /learn,
  // or /start/claim depending on the user's role.
  return NextResponse.redirect(`${origin}${next}`);
}
