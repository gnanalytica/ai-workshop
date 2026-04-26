import { redirect } from "next/navigation";
import { resolveHome } from "@/lib/auth/resolveHome";

/**
 * Single canonical entry point — resolves the user's role and redirects
 * to the appropriate home (/admin, /faculty, or /learn). Every "go home"
 * link in the app points here so role logic isn't spread across callbacks.
 */
export default async function DashboardResolver() {
  const path = await resolveHome();
  redirect(path);
}
