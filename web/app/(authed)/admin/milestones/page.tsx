import { redirect } from "next/navigation";
import { getAdminCohort } from "@/lib/queries/admin-context";

export default async function Redirect() {
  const c = await getAdminCohort();
  redirect(c ? `/admin/cohorts/${c.id}/capstones` : "/admin");
}
