import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getDayFeedbackSummary } from "@/lib/queries/day-feedback";
import { FeedbackRows } from "@/components/day-feedback/FeedbackRows";

export default async function AdminCohortFeedbackDayPage({
  params,
}: {
  params: Promise<{ cohortId: string; day: string }>;
}) {
  const { cohortId, day } = await params;
  await requireCapability("content.write", cohortId);
  const dayNumber = Number(day);
  if (!Number.isFinite(dayNumber) || dayNumber < 1) notFound();
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const summary = await getDayFeedbackSummary(cohort.id, dayNumber);

  return (
    <>
      <CohortShell cohort={cohort} active="home" />
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Day {dayNumber} feedback
        </h1>
        <Link
          href={`/admin/cohorts/${cohort.id}`}
          className="text-muted hover:text-ink text-xs"
        >
          ← Back to cohort home
        </Link>
      </header>
      <FeedbackRows summary={summary} />
    </>
  );
}
