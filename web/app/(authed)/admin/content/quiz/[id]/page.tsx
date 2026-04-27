import { redirect } from "next/navigation";
import { getAdminCohort } from "@/lib/queries/admin-context";

export default async function QuizRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getAdminCohort();
  redirect(
    c ? `/admin/cohorts/${c.id}/content/quiz/${id}` : "/admin",
  );
}
