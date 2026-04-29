import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { LessonDayView } from "@/components/lesson-day/LessonDayView";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { isPhase } from "@/lib/content/phases";

export default async function FacultyDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) notFound();
  const { n } = await params;
  const sp = await searchParams;
  return (
    <LessonDayView
      cohort={f.cohort}
      readOnly
      dayParam={n}
      railBasePath="/faculty/day"
      phaseParam={isPhase(sp.phase) ? sp.phase : undefined}
    />
  );
}
