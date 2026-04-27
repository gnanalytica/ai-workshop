import { notFound } from "next/navigation";
import { LessonDayView } from "@/components/lesson-day/LessonDayView";
import { getLessonCohort } from "@/lib/queries/cohort";

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const ctx = await getLessonCohort();
  if (!ctx) notFound();
  return (
    <LessonDayView
      cohort={ctx.cohort}
      readOnly={ctx.readOnly}
      dayParam={n}
      railBasePath="/day"
    />
  );
}
