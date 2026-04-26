import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/start`);
  }

  const sb = await getSupabaseServer();
  const { error: exchangeErr } = await sb.auth.exchangeCodeForSession(code);
  if (exchangeErr) {
    return NextResponse.redirect(`${origin}/start?error=${encodeURIComponent(exchangeErr.message)}`);
  }

  // Determine if the freshly-authenticated user has any role yet. New
  // Google sign-ups land here without a registration / cohort_faculty /
  // staff_roles entry — send them to /start/claim to redeem an invite.
  const { data: userData } = await sb.auth.getUser();
  if (userData.user) {
    const userId = userData.user.id;
    const svc = getSupabaseService();

    const [profileRes, regRes, facRes] = await Promise.all([
      svc.from("profiles").select("staff_roles").eq("id", userId).maybeSingle(),
      svc.from("registrations").select("user_id").eq("user_id", userId).limit(1).maybeSingle(),
      svc.from("cohort_faculty").select("user_id").eq("user_id", userId).limit(1).maybeSingle(),
    ]);

    const staffRoles = (profileRes.data?.staff_roles ?? []) as string[];
    const hasRole = staffRoles.length > 0 || !!regRes.data || !!facRes.data;

    if (!hasRole) {
      return NextResponse.redirect(`${origin}/start/claim`);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
