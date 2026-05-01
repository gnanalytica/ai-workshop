import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession, getProfile } from "@/lib/auth/session";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { JoinSessionClient } from "./JoinSessionClient";

/**
 * Live-session "Join" affordance for the topbar. Resolves the user's active
 * cohort + today's working day and reads its meet_link. Faculty + admin also
 * get the inline edit affordance, posting through the narrow
 * set_cohort_day_meet_link RPC (faculty deliberately do not hold
 * schedule.write).
 */
export async function JoinSession() {
  const profile = await getProfile();
  if (!profile) return null;

  // Faculty's teaching cohort wins over a registration-derived one (admins
  // may also hold a cohort_faculty row in the demo cohort).
  const fac = await getFacultyCohort();
  const cohort = fac?.cohort ?? (await getMyCurrentCohort());
  if (!cohort) return null;

  const dayNumber = todayDayNumber({
    id: cohort.id,
    slug: cohort.slug,
    name: cohort.name,
    starts_on: cohort.starts_on,
    ends_on: cohort.ends_on,
    status: cohort.status,
  });

  const sb = await getSupabaseServer();
  const { data: dayRow } = await sb
    .from("cohort_days")
    .select("meet_link")
    .eq("cohort_id", cohort.id)
    .eq("day_number", dayNumber)
    .maybeSingle();
  const meetLink = (dayRow?.meet_link as string | null) ?? null;

  const isAdmin = profile.staff_roles?.includes("admin") ?? false;
  let canEdit = isAdmin;
  if (!canEdit) {
    const session = await getSession();
    if (session) {
      const { data: facRow } = await sb
        .from("cohort_faculty")
        .select("user_id")
        .eq("cohort_id", cohort.id)
        .eq("user_id", session.id)
        .maybeSingle();
      canEdit = !!facRow;
    }
  }

  // Hide entirely when there is nothing to show or do.
  if (!meetLink && !canEdit) return null;

  return (
    <JoinSessionClient
      cohortId={cohort.id}
      dayNumber={dayNumber}
      meetLink={meetLink}
      canEdit={canEdit}
    />
  );
}
