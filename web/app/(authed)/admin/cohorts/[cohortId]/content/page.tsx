import { redirect } from "next/navigation";

export default async function ContentRedirect({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  redirect(`/admin/cohorts/${cohortId}/curriculum`);
}
