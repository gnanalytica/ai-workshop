"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getTruePersona } from "@/lib/auth/persona";
import { getSupabaseService } from "@/lib/supabase/service";
import {
  DEMO_COHORT_ID,
  SANDBOX_COHORT_COOKIE,
} from "@/lib/sandbox/active";
import { actionFail, actionOk } from "./_helpers";

const ONE_DAY_S = 60 * 60 * 24;

/**
 * Flip the calling user into sandbox mode. Allowed for admins (always) and
 * for any user who has a cohort_faculty row in the demo cohort (faculty get
 * one auto-inserted by the migration trigger).
 */
export async function enterSandbox() {
  const user = await getSession();
  if (!user) return actionFail("Not signed in.");
  const persona = await getTruePersona();
  let allowed = persona === "admin";
  if (!allowed) {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohort_faculty")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("cohort_id", DEMO_COHORT_ID)
      .maybeSingle();
    allowed = !!data;
  }
  if (!allowed) {
    return actionFail("Sandbox is only available to admins and faculty.");
  }
  const store = await cookies();
  store.set(SANDBOX_COHORT_COOKIE, DEMO_COHORT_ID, {
    path: "/",
    maxAge: ONE_DAY_S,
    sameSite: "lax",
    httpOnly: false, // read by client banner; non-secret cookie
  });
  revalidatePath("/", "layout");
  return actionOk();
}

export async function exitSandbox() {
  const store = await cookies();
  store.delete(SANDBOX_COHORT_COOKIE);
  revalidatePath("/", "layout");
  return actionOk();
}
