import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SandboxBanner } from "./SandboxBanner";
import { BannerStrip } from "./BannerStrip";
import { getProfile, getAuthCaps } from "@/lib/auth/session";
import { getTruePersona, getEffectivePersona } from "@/lib/auth/persona";
import { navForPersona } from "@/lib/rbac/menus";
import { TourMount } from "@/components/tour/Tour";
import { HelpFab } from "@/components/help/HelpFab";
import { PollPopup } from "@/components/polls/PollPopup";
import { getActiveSandboxCohortId } from "@/lib/sandbox/active";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";
import { getActiveBanner } from "@/lib/queries/banners";
import { getActivePoll } from "@/lib/queries/polls";

/**
 * Single chrome used by every authenticated route. Resolves session, fetches
 * caps, filters nav, mounts Sidebar + Topbar, renders children in MainPane.
 */
export async function AppShell({
  children,
  cohortId,
  cohortName,
  cohortStartsOn,
}: {
  children: React.ReactNode;
  cohortId?: string | null;
  cohortName?: string | null;
  cohortStartsOn?: string | null;
}) {
  // Phase 1: fan out everything that doesn't depend on activeCohortId.
  // getMyCurrentCohort is only needed when no cohortId came in via props
  // (i.e. student routes). All five helpers are React-cache wrapped, so any
  // re-call from a child component is free.
  const sandboxIdP = getActiveSandboxCohortId();
  const profileP = getProfile();
  const truePersonaP = getTruePersona();
  const effectivePersonaP = getEffectivePersona();
  const fallbackCohortP = cohortId ? Promise.resolve(null) : getMyCurrentCohort();

  const profile = await profileP;
  if (!profile) redirect("/sign-in");

  const fallbackCohort = await fallbackCohortP;
  const activeCohortId = cohortId ?? fallbackCohort?.id ?? null;
  let activeCohortName = cohortName ?? fallbackCohort?.name ?? null;
  let activeCohortStart: string | null =
    cohortStartsOn ?? fallbackCohort?.starts_on ?? null;

  // Phase 2: now that activeCohortId is resolved, fan out the dependent reads.
  // - caps: scoped to the active cohort
  // - cohortMeta: only when an injected cohortId arrived without starts_on
  //   (student route where the injecting layout doesn't have it)
  // - sandboxName: only when the sandbox cookie is set
  const sandboxId = await sandboxIdP;
  const needsCohortMeta = !!activeCohortId && activeCohortStart == null;
  // Pre-fetch the active banner and active poll server-side so the BannerStrip
  // / PollPopup client components mount with state already populated — no
  // initial /api/active-banner or /api/active-poll round-trip on first render.
  // Realtime broadcasts continue to drive subsequent updates client-side.
  const initialBannerP = activeCohortId
    ? getActiveBanner(activeCohortId).catch(() => null)
    : Promise.resolve(null);
  const initialPollP = activeCohortId
    ? getActivePoll(activeCohortId).catch(() => null)
    : Promise.resolve(null);

  const [
    caps,
    cohortMeta,
    sandboxName,
    truePersona,
    effectivePersona,
    initialBanner,
    initialPoll,
  ] = await Promise.all([
    getAuthCaps(activeCohortId),
    needsCohortMeta
      ? getSupabaseServer().then((sb) =>
          sb
            .from("cohorts")
            .select("starts_on, name")
            .eq("id", activeCohortId!)
            .maybeSingle()
            .then((r) => r.data as { starts_on?: string; name?: string } | null),
        )
      : Promise.resolve(null),
    sandboxId
      ? getSupabaseService()
          .from("cohorts")
          .select("name")
          .eq("id", sandboxId)
          .maybeSingle()
          .then(
            (r) =>
              (r.data?.name as string | undefined) ?? "Sandbox Cohort (DEMO)",
          )
      : Promise.resolve(null),
    truePersonaP,
    effectivePersonaP,
    initialBannerP,
    initialPollP,
  ]);

  if (cohortMeta) {
    activeCohortStart = cohortMeta.starts_on ?? null;
    if (!activeCohortName) activeCohortName = cohortMeta.name ?? null;
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

  const items = navForPersona(caps, effectivePersona);

  // Show the first-login tour to anyone who hasn't completed it. Driven by
  // the user's *true* persona (not effective) so admins previewing as a
  // student don't restart their tour. The mount also listens for manual
  // re-launch events fired by <StartGuideButton>.
  const initialOpen = !profile.onboarded_at;

  return (
    <div className="bg-bg text-ink flex min-h-screen flex-col">
      {activeCohortId && (
        <BannerStrip cohortId={activeCohortId} initialBanner={initialBanner} />
      )}
      {sandboxName && <SandboxBanner cohortName={sandboxName} />}
      <div className="flex flex-1">
        <Sidebar caps={caps} persona={effectivePersona} bannerOffset={!!sandboxName} />
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
      {activeCohortId && caps.includes("attendance.self") && (
        <PollPopup cohortId={activeCohortId} initialPoll={initialPoll} />
      )}
    </div>
  );
}
