import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { getCohortDay } from "@/lib/queries/cohort";
import { ScheduleDayEditor } from "@/app/(authed)/admin/schedule/[day]/ScheduleDayEditor";

export default async function CohortScheduleDayPage({
  params,
}: {
  params: Promise<{ cohortId: string; day: string }>;
}) {
  const { cohortId, day } = await params;
  const dayNumber = Number(day);
  if (!Number.isFinite(dayNumber)) notFound();
  await requireCapability("schedule.write");
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const cd = await getCohortDay(cohort.id, dayNumber);
  if (!cd) notFound();

  return (
    <>
      <CohortShell cohort={cohort} active="schedule" />
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <Link
            href={`/admin/cohorts/${cohort.id}/schedule`}
            className="text-muted hover:text-ink text-xs"
          >
            ← Back to schedule
          </Link>
          <p className="text-accent mt-2 font-mono text-xs tracking-widest uppercase">
            {cohort.name} · Day {dayNumber}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cd.title}</h1>
        </header>
        <ScheduleDayEditor cohortId={cohort.id} day={cd} />
        {!cd && (
          <Card>
            <CardTitle>Not found</CardTitle>
          </Card>
        )}
      </div>
    </>
  );
}
