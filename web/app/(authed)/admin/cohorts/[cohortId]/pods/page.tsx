import { redirect } from "next/navigation";

export default async function CohortPodsRedirect({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  redirect(`/pods?cohort=${cohortId}`);
}
