import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SandboxBanner } from "./SandboxBanner";
import { getProfile, getAuthCaps } from "@/lib/auth/session";
import { getTruePersona, getEffectivePersona } from "@/lib/auth/persona";
import { navForPersona } from "@/lib/rbac/menus";
import { TourMount } from "@/components/tour/Tour";
import { HelpFab } from "@/components/help/HelpFab";
import { getActiveSandboxCohortId } from "@/lib/sandbox/active";
import { getSupabaseService } from "@/lib/supabase/service";

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

  // Sandbox banner — only when the cookie is present AND the user is allowed
  // to enter (admins always; faculty if they have the demo cohort_faculty row).
  const sandboxId = await getActiveSandboxCohortId();
  let sandboxName: string | null = null;
  if (sandboxId) {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("cohorts")
      .select("name")
      .eq("id", sandboxId)
      .maybeSingle();
    sandboxName = (data?.name as string | undefined) ?? "Sandbox Cohort (DEMO)";
  }

  return (
    <div className="bg-bg text-ink flex min-h-screen flex-col">
      {sandboxName && <SandboxBanner cohortName={sandboxName} />}
      <div className="flex flex-1">
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
      <TourMount persona={truePersona} initialOpen={initialOpen} />
      <HelpFab />
    </div>
  );
}
