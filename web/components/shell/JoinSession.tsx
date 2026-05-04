import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession, getProfile } from "@/lib/auth/session";
import { getEffectivePersona } from "@/lib/auth/persona";
import { JoinSessionClient } from "./JoinSessionClient";

/**
 * Live-session "Join" affordance for the topbar. Reads the meet_link off the
 * cohort row (workshops use one recurring room — see migration 0088), so
 * admin / faculty / student all share a single source of truth across every
 * day of the cohort.
 */
export async function JoinSession({
  cohortId,
  cohortName,
}: {
  cohortId: string | null;
  cohortName: string | null;
}) {
  if (!cohortId) return null;

  const profile = await getProfile();
  if (!profile) return null;

  const sb = await getSupabaseServer();
  const { data: cohortRow } = await sb
    .from("cohorts")
    .select("meet_link")
    .eq("id", cohortId)
    .maybeSingle();
  const meetLink = (cohortRow?.meet_link as string | null) ?? null;

  // Honor preview-as: when an admin previews as student we want the edit
  // affordance hidden so the chrome reflects what a real student would see.
  // The underlying server action still re-checks real perms, so this is
  // visual-only — no security implication.
  const effective = await getEffectivePersona();
  const isAdmin =
    (profile.staff_roles?.includes("admin") ?? false) && effective !== "student";
  let canEdit = isAdmin;
  if (!canEdit && effective !== "student") {
    const session = await getSession();
    if (session) {
      const { data: facRow } = await sb
        .from("cohort_faculty")
        .select("user_id")
        .eq("cohort_id", cohortId)
        .eq("user_id", session.id)
        .maybeSingle();
      canEdit = !!facRow;
    }
  }

  // Hide entirely when there is nothing to show or do.
  if (!meetLink && !canEdit) return null;

  return (
    <JoinSessionClient
      cohortId={cohortId}
      cohortName={cohortName}
      meetLink={meetLink}
      canEdit={canEdit}
    />
  );
}
