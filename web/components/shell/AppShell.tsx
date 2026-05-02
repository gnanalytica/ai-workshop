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
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";

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

  // Single source of truth for "the cohort this user is currently working in".
  // Faculty/admin paths inject cohortId via the route layout; for students the
  // shell layout doesn't know it, so fall back to their registration (or the
  // most-recent live cohort under RLS). This same id flows into the topbar's
  // Join button so admin/faculty/student all read+write the same cohort_days
  // row when they're on the same cohort.
  let activeCohortId = cohortId ?? null;
  let activeCohortName = cohortName ?? null;
  let activeCohortStart: string | null = null;
  if (!activeCohortId) {
    const fallback = await getMyCurrentCohort();
    if (fallback) {
      activeCohortId = fallback.id;
      activeCohortName = fallback.name;
      activeCohortStart = fallback.starts_on;
    }
  } else {
    // We have an injected cohortId but need starts_on for the day-number calc.
    // Stay on the RLS-respecting client — the injecting layout already proved
    // the user can see this cohort.
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("cohorts")
      .select("starts_on, name")
      .eq("id", activeCohortId)
      .maybeSingle();
    activeCohortStart = (data?.starts_on as string | undefined) ?? null;
    if (!activeCohortName) activeCohortName = (data?.name as string | undefined) ?? null;
  }

  const activeDayNumber =
    activeCohortStart != null
      ? todayDayNumber({
          id: activeCohortId!,
          slug: "",
          name: activeCohortName ?? "",
          starts_on: activeCohortStart,
          ends_on: activeCohortStart,
          status: "live",
        })
      : null;

  const [caps, truePersona, effectivePersona] = await Promise.all([
    getAuthCaps(activeCohortId),
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
            cohortName={activeCohortName}
            truePersona={truePersona}
            effectivePersona={effectivePersona}
            activeCohortId={activeCohortId}
            activeDayNumber={activeDayNumber}
          />
          <main className="min-w-0 flex-1 overflow-x-hidden px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-8">
            {children}
          </main>
        </div>
      </div>
      <TourMount persona={truePersona} initialOpen={initialOpen} />
      <HelpFab persona={effectivePersona} />
    </div>
  );
}
