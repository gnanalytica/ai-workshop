"use server";

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

export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email." };
  }

  const sb = await getSupabaseServer();
  const next = safeNext(parsed.data.next);

  const { error } = await sb.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Check your email for the sign-in link." };
}

/**
 * Single-entry "Enroll / Sign in" flow. Looks up the email; if a profile
 * exists, sends a magic link (sign-in). Otherwise redirects to /start/sign-up
 * so the user can pick a role and redeem an invite code.
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

const signUpSchema = z
  .object({
    email: z.string().email(),
    full_name: z.string().min(1, "Name is required").max(120),
    role: z.enum(["student", "faculty", "staff"]),
    cohort_code: z.string().trim().optional(),
    faculty_code: z.string().trim().optional(),
    staff_code: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.role === "student" && !v.cohort_code) {
      ctx.addIssue({ code: "custom", path: ["cohort_code"], message: "Cohort code required" });
    }
    if (v.role === "faculty" && !v.faculty_code) {
      ctx.addIssue({ code: "custom", path: ["faculty_code"], message: "Faculty code required" });
    }
    if (v.role === "staff" && !v.staff_code) {
      ctx.addIssue({ code: "custom", path: ["staff_code"], message: "Staff code required" });
    }
  });

export type SignUpState = SignInState;

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    cohort_code: formData.get("cohort_code") || undefined,
    faculty_code: formData.get("faculty_code") || undefined,
    staff_code: formData.get("staff_code") || undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid form";
    return { ok: false, message: first };
  }
  const v = parsed.data;
  const email = v.email.toLowerCase();
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

  // Validate codes up-front so we don't create an auth user we can't redeem against.
  const codesToValidate = [v.cohort_code, v.faculty_code, v.staff_code].filter(Boolean) as string[];
  for (const code of codesToValidate) {
    const { error } = await svc.rpc("rpc_validate_invite", { p_code: code } as never);
    if (error) return { ok: false, message: `Invite code "${code}" is not valid.` };
  }

  // Create the auth user (idempotent guard: if email already exists in auth, error out).
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: v.full_name },
  });
  if (createErr || !created.user) {
    return { ok: false, message: createErr?.message ?? "Could not create account." };
  }
  const userId = created.user.id;

  // Upsert profile row (the auth.users insert trigger may already have created
  // a stub; either way we set full_name).
  const { error: profileErr } = await svc
    .from("profiles")
    .upsert({ id: userId, email, full_name: v.full_name }, { onConflict: "id" });
  if (profileErr) return { ok: false, message: profileErr.message };

  // Redeem code(s) via SECURITY DEFINER RPCs.
  if (v.role === "student") {
    const { error } = await svc.rpc("rpc_redeem_student_invite", {
      p_code: v.cohort_code!,
      p_user: userId,
    } as never);
    if (error) return { ok: false, message: error.message };
  } else if (v.role === "faculty") {
    // Cohort code grants the cohort assignment; faculty code is a second factor
    // that must be of kind=faculty for this cohort.
    const { error: cErr } = await svc.rpc("rpc_redeem_faculty_invite", {
      p_code: v.faculty_code!,
      p_user: userId,
    } as never);
    if (cErr) return { ok: false, message: cErr.message };
  } else if (v.role === "staff") {
    const { error } = await svc.rpc("rpc_redeem_staff_invite", {
      p_code: v.staff_code!,
      p_user: userId,
    } as never);
    if (error) return { ok: false, message: error.message };
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
const claimSchema = z
  .object({
    full_name: z.string().trim().min(1, "Name is required").max(120),
    role: z.enum(["student", "faculty", "staff"]),
    cohort_code: z.string().trim().optional(),
    faculty_code: z.string().trim().optional(),
    staff_code: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.role === "student" && !v.cohort_code) {
      ctx.addIssue({ code: "custom", path: ["cohort_code"], message: "Cohort code required" });
    }
    if (v.role === "faculty" && !v.faculty_code) {
      ctx.addIssue({ code: "custom", path: ["faculty_code"], message: "Faculty code required" });
    }
    if (v.role === "staff" && !v.staff_code) {
      ctx.addIssue({ code: "custom", path: ["staff_code"], message: "Staff code required" });
    }
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
    role: formData.get("role"),
    cohort_code: formData.get("cohort_code") || undefined,
    faculty_code: formData.get("faculty_code") || undefined,
    staff_code: formData.get("staff_code") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  const v = parsed.data;
  const svc = getSupabaseService();

  // Persist confirmed name on the profile (auto-created by handle_new_auth_user
  // trigger; we always overwrite with what the user typed here).
  const { error: nameErr } = await svc
    .from("profiles")
    .update({ full_name: v.full_name })
    .eq("id", userId);
  if (nameErr) return { ok: false, message: nameErr.message };

  // Validate codes first to avoid half-applied state.
  const codes = [v.cohort_code, v.faculty_code, v.staff_code].filter(Boolean) as string[];
  for (const code of codes) {
    const { error } = await svc.rpc("rpc_validate_invite", { p_code: code } as never);
    if (error) return { ok: false, message: `Invite code "${code}" is not valid.` };
  }

  if (v.role === "student") {
    const { error } = await svc.rpc("rpc_redeem_student_invite", {
      p_code: v.cohort_code!,
      p_user: userId,
    } as never);
    if (error) return { ok: false, message: error.message };
  } else if (v.role === "faculty") {
    const { error } = await svc.rpc("rpc_redeem_faculty_invite", {
      p_code: v.faculty_code!,
      p_user: userId,
    } as never);
    if (error) return { ok: false, message: error.message };
  } else if (v.role === "staff") {
    const { error } = await svc.rpc("rpc_redeem_staff_invite", {
      p_code: v.staff_code!,
      p_user: userId,
    } as never);
    if (error) return { ok: false, message: error.message };
  }

  redirect("/dashboard");
}
