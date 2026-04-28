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
    // Prefetchers (LinkedIn, Outlook safe-link scanners) often hit the link
    // before the user, burning the one-time code. Surface a friendly message
    // for that case and let the raw error through for everything else.
    const msg = error.message.toLowerCase();
    const friendly =
      msg.includes("expired") ||
      msg.includes("already") ||
      msg.includes("invalid") ||
      msg.includes("used")
        ? "This sign-in link has already been used or expired. Request a new one below."
        : error.message;
    return NextResponse.redirect(`${origin}/start?error=${encodeURIComponent(friendly)}`);
  }

  // /dashboard runs resolveHome() and redirects to /admin, /faculty, /learn,
  // or /start/claim depending on the user's role.
  return NextResponse.redirect(`${origin}${next}`);
}
