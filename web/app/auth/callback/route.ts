import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/start`);
  }

  const sb = await getSupabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/start?error=${encodeURIComponent(error.message)}`);
  }

  // Hand off to the resolver — it computes the right home (/admin, /faculty,
  // /learn) or routes to /start/claim if the user has no role yet.
  return NextResponse.redirect(`${origin}/dashboard`);
}
