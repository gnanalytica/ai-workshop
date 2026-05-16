import { redirect } from "next/navigation";

/**
 * Cohort landing now redirects to /pulse — the old Overview page duplicated
 * the headline KPIs, attention queue, and day-feedback summary that Pulse
 * already surfaces (with charts). The one unique signal — the activity
 * feed — lives inside Pulse's Engagement tab.
 */
export default async function AdminCohortHome({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  redirect(`/admin/cohorts/${cohortId}/pulse`);
}
