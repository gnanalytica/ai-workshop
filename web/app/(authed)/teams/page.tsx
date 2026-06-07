import { redirect } from "next/navigation";

// Teams are now admin-managed and the final deliverable lives on the capstone
// surface. The old self-service team page redirects there.
export default function TeamsPage() {
  redirect("/capstone");
}
