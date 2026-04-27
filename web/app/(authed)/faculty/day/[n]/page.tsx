import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { LessonDayView } from "@/components/lesson-day/LessonDayView";
import { getFacultyCohort } from "@/lib/queries/faculty";

export default async function FacultyDayPage({ params }: { params: Promise<{ n: string }> }) {
  await requireCapability("roster.read");
  const f = await getFacultyCohort();
  if (!f) notFound();
  const { n } = await params;
  return (
    <LessonDayView
      cohort={f.cohort}
      readOnly
      dayParam={n}
      railBasePath="/faculty/day"
    />
  );
}
