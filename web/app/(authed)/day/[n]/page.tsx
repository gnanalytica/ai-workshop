import { notFound } from "next/navigation";
import { LessonDayView } from "@/components/lesson-day/LessonDayView";
import { getLessonCohort } from "@/lib/queries/cohort";
import { isPhase } from "@/lib/content/phases";

export default async function DayPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { n } = await params;
  const sp = await searchParams;
  const ctx = await getLessonCohort();
  if (!ctx) notFound();
  return (
    <LessonDayView
      cohort={ctx.cohort}
      readOnly={ctx.readOnly}
      dayParam={n}
      railBasePath="/day"
      phaseParam={isPhase(sp.phase) ? sp.phase : undefined}
    />
  );
}
