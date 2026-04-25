import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { getCohortDay } from "@/lib/queries/cohort";
import { ScheduleDayEditor } from "./ScheduleDayEditor";

export default async function ScheduleDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = Number(day);
  if (!Number.isFinite(dayNumber)) notFound();
  await requireCapability("schedule.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const cd = await getCohortDay(cohort.id, dayNumber);
  if (!cd) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {cohort.name} · Day {dayNumber}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cd.title}</h1>
      </header>
      <ScheduleDayEditor cohortId={cohort.id} day={cd} />
    </div>
  );
}
