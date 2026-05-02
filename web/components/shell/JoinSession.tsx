import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession, getProfile } from "@/lib/auth/session";
import { getCohortDayCached } from "@/lib/cache/cohort";
import { JoinSessionClient } from "./JoinSessionClient";

/**
 * Live-session "Join" affordance for the topbar. Reads the meet_link off the
 * cohort_days row that AppShell already resolved for this user, so admin /
 * faculty / student all share a single source of truth: when they're on the
 * same cohort they see the same link, and when they edit it everyone on that
 * cohort sees the update on next request.
 */
export async function JoinSession({
  cohortId,
  cohortName,
  dayNumber,
}: {
  cohortId: string | null;
  cohortName: string | null;
  dayNumber: number | null;
}) {
  if (!cohortId || dayNumber == null) return null;

  const profile = await getProfile();
  if (!profile) return null;

  // Cross-request cached: cohort_days changes rarely, runs on every authed page.
  const dayRow = await getCohortDayCached(cohortId, dayNumber);
  const meetLink = dayRow?.meet_link ?? null;
  const sb = await getSupabaseServer();

  const isAdmin = profile.staff_roles?.includes("admin") ?? false;
  let canEdit = isAdmin;
  if (!canEdit) {
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
      dayNumber={dayNumber}
      meetLink={meetLink}
      canEdit={canEdit}
    />
  );
}
