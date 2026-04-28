import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { getProfile, getAuthCaps } from "@/lib/auth/session";
import { getTruePersona, getEffectivePersona } from "@/lib/auth/persona";
import { navForPersona } from "@/lib/rbac/menus";
import { TourMount } from "@/components/tour/Tour";

/**
 * Single chrome used by every authenticated route. Resolves session, fetches
 * caps, filters nav, mounts Sidebar + Topbar, renders children in MainPane.
 */
export async function AppShell({
  children,
  cohortId,
  cohortName,
}: {
  children: React.ReactNode;
  cohortId?: string | null;
  cohortName?: string | null;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  const [caps, truePersona, effectivePersona] = await Promise.all([
    getAuthCaps(cohortId ?? null),
    getTruePersona(),
    getEffectivePersona(),
  ]);
  const items = navForPersona(caps, effectivePersona);

  // Show the first-login tour to anyone who hasn't completed it. Driven by
  // the user's *true* persona (not effective) so admins previewing as a
  // student don't restart their tour. The mount also listens for manual
  // re-launch events fired by <StartGuideButton>.
  const initialOpen = !profile.onboarded_at;

  return (
    <div className="bg-bg text-ink flex min-h-screen">
      <Sidebar caps={caps} persona={effectivePersona} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          profile={profile}
          navItems={items}
          cohortName={cohortName}
          truePersona={truePersona}
          effectivePersona={effectivePersona}
        />
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
      <TourMount persona={truePersona} initialOpen={initialOpen} />
    </div>
  );
}
