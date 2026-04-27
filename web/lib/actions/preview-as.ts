"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getTruePersona,
  PREVIEW_COOKIE,
  PREVIEW_COHORT_COOKIE,
  PREVIEW_USER_COOKIE,
} from "@/lib/auth/persona";
import { getSupabaseService } from "@/lib/supabase/service";
import type { PreviewCohortOption, PreviewUserOption } from "./preview-as.types";

const uuid = z.string().uuid();

const schema = z.object({
  persona: z.enum(["admin", "faculty", "student"]),
  cohortId: z.string().optional(),
  userId: z.string().optional(),
});

const cookieOpts = {
  path: "/",
  sameSite: "lax" as const,
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Admin-only: set the previewAs cookie so the sidebar shows another
 * persona's navigation, plus optional `cohortId` / `userId` targets that
 * the data-loading queries honor. Cookies are ignored if the caller isn't
 * an admin.
 */
export async function setPreviewAs(formData: FormData) {
  const parsed = schema.safeParse({
    persona: formData.get("persona"),
    cohortId: formData.get("cohortId") ?? undefined,
    userId: formData.get("userId") ?? undefined,
  });
  if (!parsed.success) return;
  if ((await getTruePersona()) !== "admin") return;

  const store = await cookies();
  const { persona, cohortId, userId } = parsed.data;

  if (persona === "admin") {
    store.delete(PREVIEW_COOKIE);
    store.delete(PREVIEW_COHORT_COOKIE);
    store.delete(PREVIEW_USER_COOKIE);
    revalidatePath("/", "layout");
    return;
  }

  store.set(PREVIEW_COOKIE, persona, cookieOpts);

  if (persona === "faculty") {
    store.delete(PREVIEW_USER_COOKIE);
    if (cohortId && uuid.safeParse(cohortId).success) {
      store.set(PREVIEW_COHORT_COOKIE, cohortId, cookieOpts);
    } else if (cohortId === "") {
      store.delete(PREVIEW_COHORT_COOKIE);
    }
  } else if (persona === "student") {
    store.delete(PREVIEW_COHORT_COOKIE);
    if (userId && uuid.safeParse(userId).success) {
      store.set(PREVIEW_USER_COOKIE, userId, cookieOpts);
    } else if (userId === "") {
      store.delete(PREVIEW_USER_COOKIE);
    }
  }
  revalidatePath("/", "layout");
}

/** Admin-only: list every cohort for the preview cohort picker. */
export async function listAllCohorts(): Promise<PreviewCohortOption[]> {
  if ((await getTruePersona()) !== "admin") return [];
  const svc = getSupabaseService();
  const { data } = await svc
    .from("cohorts")
    .select("id, name, slug, status")
    .order("starts_on", { ascending: false });
  return (data ?? []) as PreviewCohortOption[];
}

/** Admin-only: search confirmed-student profiles by name or email. */
export async function searchPreviewUsers(q: string): Promise<PreviewUserOption[]> {
  if ((await getTruePersona()) !== "admin") return [];
  const term = q.trim();
  if (term.length < 2) return [];
  const svc = getSupabaseService();
  const like = `%${term.replace(/[%_]/g, "\\$&")}%`;
  const { data } = await svc
    .from("profiles")
    .select("id, full_name, email, registrations!inner(status)")
    .eq("registrations.status", "confirmed")
    .or(`full_name.ilike.${like},email.ilike.${like}`)
    .limit(15);
  return ((data ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
  }));
}

/** Clear cohort/user preview targets but keep the persona. */
export async function clearPreviewTargets() {
  if ((await getTruePersona()) !== "admin") return;
  const store = await cookies();
  store.delete(PREVIEW_COHORT_COOKIE);
  store.delete(PREVIEW_USER_COOKIE);
  revalidatePath("/", "layout");
}
