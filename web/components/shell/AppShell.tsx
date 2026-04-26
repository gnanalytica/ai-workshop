import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { getProfile, getAuthCaps } from "@/lib/auth/session";
import { getTruePersona, getEffectivePersona } from "@/lib/auth/persona";
import { navForPersona } from "@/lib/rbac/menus";

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
    </div>
  );
}
