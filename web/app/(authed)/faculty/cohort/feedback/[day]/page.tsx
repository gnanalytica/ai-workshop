import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardTitle } from "@/components/ui/card";
import { getFacultyCohort } from "@/lib/queries/faculty";
import {
  getDayFeedbackSummary,
  getFacultyPrimaryPodId,
} from "@/lib/queries/day-feedback";
import { FeedbackRows } from "@/components/day-feedback/FeedbackRows";

export default async function FacultyCohortFeedbackDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  await requireCapability("roster.read");
  const { day } = await params;
  const dayNumber = Number(day);
  if (!Number.isFinite(dayNumber) || dayNumber < 1) notFound();
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) {
    return (
      <Card>
        <CardTitle>You aren&apos;t assigned to a cohort.</CardTitle>
      </Card>
    );
  }

  const podId = await getFacultyPrimaryPodId(f.cohort.id, me.id);
  const summary = await getDayFeedbackSummary(
    f.cohort.id,
    dayNumber,
    podId ?? undefined,
  );

  return (
    <div className="space-y-5">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · your pod
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Day {dayNumber} feedback
        </h1>
        <Link
          href="/faculty/cohort"
          className="text-muted hover:text-ink mt-1 inline-block text-xs"
        >
          ← Back to faculty cohort
        </Link>
      </header>

      <FeedbackRows summary={summary} />
    </div>
  );
}
