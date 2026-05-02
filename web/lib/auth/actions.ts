"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";

const emailSchema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

export type SignInState = {
  ok?: boolean;
  message?: string;
};

function safeNext(next: string | undefined | null): string {
  return next && next.startsWith("/") ? next : "/dashboard";
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function clientIp(): Promise<string> {
  const h = await headers();
  // Vercel forwards real client IP in x-forwarded-for. Fall back so dev works.
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Postgres-backed rate limit. Returns true if allowed; false if the bucket is
 * over its quota in the current window. We use the service client because the
 * caller is anonymous (no session) and the RPC is SECURITY DEFINER but still
 * requires *some* role to execute.
 */
async function rateOk(bucket: string, windowSec: number, max: number): Promise<boolean> {
  const svc = getSupabaseService();
  const { data, error } = await svc.rpc("rpc_auth_rate_limit_check", {
    p_bucket: bucket,
    p_window_s: windowSec,
    p_max: max,
  } as never);
  if (error) {
    // Fail-open on transient errors so a DB hiccup doesn't lock everyone out.
    return true;
  }
  return data === true;
}

/**
 * Single-entry "Enroll / Sign in" flow. Looks up the email; if a profile
 * exists, sends a magic link (sign-in). Otherwise redirects to /start/sign-up
 * where the user redeems an invite code — role is derived from the code's kind.
 */
export type StartState = SignInState & { mode?: "signin" | "signup" };

export async function startFlow(_prev: StartState, formData: FormData): Promise<StartState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email." };
  }
  const email = parsed.data.email.toLowerCase();
  const next = safeNext(parsed.data.next);

  // 10 start attempts per IP per 5 minutes.
  if (!(await rateOk(`start:${await clientIp()}`, 300, 10))) {
    return { ok: false, message: "Too many requests. Please wait a minute and try again." };
  }

  const svc = getSupabaseService();
  const { data: existing } = await svc
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const sb = await getSupabaseServer();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) return { ok: false, message: error.message, mode: "signin" };
    return { ok: true, mode: "signin", message: "Check your email for the sign-in link." };
  }

  // No profile → redirect to sign-up. (redirect() throws; the function never returns.)
  redirect(`/start/sign-up?email=${encodeURIComponent(email)}`);
}

const signUpSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1, "Name is required").max(120),
  code: z.string().trim().min(1, "Invite code required").max(64),
});

export type SignUpState = SignInState;

type InviteKind = "student" | "faculty" | "staff";

async function resolveInviteKind(
  svc: ReturnType<typeof getSupabaseService>,
  code: string,
): Promise<{ kind: InviteKind } | { error: string }> {
  const { data, error } = await svc.rpc("rpc_validate_invite", { p_code: code } as never);
  if (error) return { error: `Invite code "${code}" is not valid.` };
  const row = Array.isArray(data) ? data[0] : data;
  const kind = (row as { kind?: InviteKind } | null)?.kind;
  if (!kind) return { error: `Invite code "${code}" is not valid.` };
  return { kind };
}

/**
 * Live preview of an invite code — used by the sign-up form to show
 * "✓ Valid for cohort X (faculty)" before the user submits. Shape mirrors
 * rpc_validate_invite output so the UI can show role + cohort.
 */
export type InvitePreview =
  | {
      ok: true;
      kind: InviteKind;
      cohort_name: string | null;
      staff_role: string | null;
    }
  | { ok: false; message: string };

export async function previewInvite(code: string): Promise<InvitePreview> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, message: "Enter an invite code." };
  if (trimmed.length > 64) return { ok: false, message: "Code is too long." };

  // 30 previews per IP per minute. Keystroke-debounced from the UI; this is
  // the brute-force ceiling.
  if (!(await rateOk(`preview:${await clientIp()}`, 60, 30))) {
    return { ok: false, message: "Too many checks. Slow down for a moment." };
  }

  const svc = getSupabaseService();
  const { data, error } = await svc.rpc("rpc_validate_invite", {
    p_code: trimmed,
  } as never);
  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (msg.includes("expired")) return { ok: false, message: "This invite code has expired." };
    if (msg.includes("redeemed"))
      return { ok: false, message: "This invite code has already been redeemed." };
    return { ok: false, message: "We couldn't find that invite code." };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        kind: InviteKind;
        cohort_name: string | null;
        staff_role: string | null;
      }
    | null;
  if (!row) return { ok: false, message: "We couldn't find that invite code." };
  return {
    ok: true,
    kind: row.kind,
    cohort_name: row.cohort_name,
    staff_role: row.staff_role,
  };
}

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid form";
    return { ok: false, message: first };
  }
  const v = parsed.data;
  const email = v.email.toLowerCase();
  const code = v.code.toUpperCase();

  // 5 sign-up attempts per IP per 10 minutes — accounts for the rare honest
  // retry but blocks code-guessing bursts.
  if (!(await rateOk(`signup:${await clientIp()}`, 600, 5))) {
    return { ok: false, message: "Too many sign-up attempts. Please wait a few minutes." };
  }

  const svc = getSupabaseService();

  // Already-registered guard: someone landed on /start/sign-up via back button or
  // a stale link. Send them a sign-in magic link instead of trying to recreate.
  const { data: existingProfile } = await svc
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile) {
    const sb = await getSupabaseServer();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/dashboard` },
    });
    if (error) return { ok: false, message: error.message };
    return {
      ok: true,
      message:
        "You already have an account — we sent you a sign-in link instead. Check your email.",
    };
  }

  // Validate the code up-front so we don't create an auth user we can't redeem against.
  const resolved = await resolveInviteKind(svc, code);
  if ("error" in resolved) return { ok: false, message: resolved.error };

  // Create the auth user. Edge case: the email already exists in auth.users
  // (e.g. user Google-auth'd, then bailed before redeeming) but has no profile
  // role yet. Detect that and send them to /start/claim with a magic link
  // instead of erroring out cryptically.
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: v.full_name },
  });
  if (createErr || !created.user) {
    const msg = (createErr?.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exist")) {
      const sb = await getSupabaseServer();
      const { error: otpErr } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/start/claim` },
      });
      if (otpErr) return { ok: false, message: otpErr.message };
      return {
        ok: true,
        message:
          "An account with this email already exists. We sent you a sign-in link — open it and you can redeem your invite code on the next screen.",
      };
    }
    return { ok: false, message: createErr?.message ?? "Could not create account." };
  }
  const userId = created.user.id;

  // Upsert profile row (the auth.users insert trigger may already have created
  // a stub; either way we set full_name).
  const { error: profileErr } = await svc
    .from("profiles")
    .upsert({ id: userId, email, full_name: v.full_name }, { onConflict: "id" });
  if (profileErr) return { ok: false, message: profileErr.message };

  const redeemErr = await redeemByKind(svc, resolved.kind, code, userId);
  if (redeemErr) {
    // Race: code was exhausted between validate and redeem, or a role-invariant
    // trigger fired. Roll back the just-created auth user so the email is free
    // to retry with a different code.
    await svc.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, message: redeemErr };
  }

  // Generate a one-time magic link server-side and redirect the browser
  // straight to it — no email round-trip. The link hits /auth/callback,
  // which exchanges it for a session cookie and lands on /dashboard.
  const { data: linkData, error: linkErr } = await svc.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${siteUrl()}/auth/callback?next=/dashboard` },
  });
  if (linkErr || !linkData.properties?.action_link) {
    return { ok: false, message: linkErr?.message ?? "Could not generate sign-in link." };
  }
  redirect(linkData.properties.action_link);
}

async function redeemByKind(
  svc: ReturnType<typeof getSupabaseService>,
  kind: InviteKind,
  code: string,
  userId: string,
): Promise<string | null> {
  const rpc =
    kind === "student"
      ? "rpc_redeem_student_invite"
      : kind === "faculty"
        ? "rpc_redeem_faculty_invite"
        : "rpc_redeem_staff_invite";
  const { error } = await svc.rpc(rpc, { p_code: code, p_user: userId } as never);
  return error?.message ?? null;
}

export async function signOut() {
  const sb = await getSupabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

/**
 * Kick off Google OAuth via Supabase. Server action: gets the provider URL
 * from Supabase and redirects the browser there. Google then sends the user
 * back to Supabase's /auth/v1/callback, which forwards to our /auth/callback.
 */
export async function signInWithGoogle(formData: FormData) {
  const next = safeNext((formData.get("next") as string) ?? "/dashboard");
  const sb = await getSupabaseServer();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error || !data?.url) {
    throw new Error(error?.message ?? "Could not start Google sign-in");
  }
  redirect(data.url);
}

/**
 * For Google-authenticated users with no role yet. The user is already
 * signed in (auth.users + profiles row exist via the on-insert trigger),
 * but they have no registration / cohort_faculty / staff_roles. They land
 * here from /auth/callback after OAuth, redeem an invite, and go to /dashboard.
 */
const claimSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(120),
  code: z.string().trim().min(1, "Invite code required").max(64),
});

export async function claimInvite(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const sb = await getSupabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) {
    redirect("/start");
  }
  const userId = userData.user.id;

  const parsed = claimSchema.safeParse({
    full_name: formData.get("full_name"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  const v = parsed.data;
  const code = v.code.toUpperCase();
  const svc = getSupabaseService();

  // Persist confirmed name on the profile (auto-created by handle_new_auth_user
  // trigger; we always overwrite with what the user typed here).
  const { error: nameErr } = await svc
    .from("profiles")
    .update({ full_name: v.full_name })
    .eq("id", userId);
  if (nameErr) return { ok: false, message: nameErr.message };

  const resolved = await resolveInviteKind(svc, code);
  if ("error" in resolved) return { ok: false, message: resolved.error };

  const redeemErr = await redeemByKind(svc, resolved.kind, code, userId);
  if (redeemErr) return { ok: false, message: redeemErr };

  redirect("/dashboard");
}
