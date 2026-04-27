import { redirect } from "next/navigation";
import { getAdminCohort } from "@/lib/queries/admin-context";

export default async function Redirect({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const [{ day }, c] = await Promise.all([params, getAdminCohort()]);
  redirect(c ? `/admin/cohorts/${c.id}/schedule/${day}` : "/admin");
}
