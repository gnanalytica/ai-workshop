import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { LessonDayView } from "@/components/lesson-day/LessonDayView";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { isPhase } from "@/lib/content/phases";

export default async function AdminCohortDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string; n: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  await requireCapability("content.write");
  const { cohortId, n } = await params;
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();
  const sp = await searchParams;
  return (
    <LessonDayView
      cohort={{
        id: cohort.id,
        slug: cohort.slug,
        name: cohort.name,
        starts_on: cohort.starts_on,
        ends_on: cohort.ends_on,
        status: (cohort.status as "draft" | "live" | "archived") ?? "draft",
      }}
      readOnly
      dayParam={n}
      railBasePath="/faculty/day"
      phaseParam={isPhase(sp.phase) ? sp.phase : undefined}
    />
  );
}
