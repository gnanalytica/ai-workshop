import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BannerStrip } from "./BannerStrip";
import { PersonaBanner } from "./PersonaBanner";
import { PresentMode } from "./PresentMode";
import { getProfile } from "@/lib/auth/session";
import { getTruePersona, getEffectivePersona } from "@/lib/auth/persona";
import { navForPersona } from "@/lib/rbac/menus";
import { TourMount } from "@/components/tour/Tour";
import { PollPopup } from "@/components/polls/PollPopup";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { getShellState } from "@/lib/queries/shell";

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

  const needsCohortMeta = !!activeCohortId && activeCohortStart == null;

  const [shellState, cohortMeta, truePersona, effectivePersona] =
    await Promise.all([
      getShellState(activeCohortId).catch(
        () => ({ caps: [], banner: null, poll: null }) as Awaited<ReturnType<typeof getShellState>>,
      ),
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
      truePersonaP,
      effectivePersonaP,
    ]);

  const { caps, banner: initialBanner, poll: initialPoll } = shellState;

  if (cohortMeta) {
    activeCohortStart = cohortMeta.starts_on ?? null;
    if (!activeCohortName) activeCohortName = cohortMeta.name ?? null;
  }

  const items = navForPersona(caps, effectivePersona);

  // Show the first-login tour to anyone who hasn't completed it. Driven by
  // the user's *true* persona (not effective) so admins previewing as a
  // student don't restart their tour. The mount also listens for manual
  // re-launch events fired by <StartGuideButton>.
  const initialOpen = !profile.onboarded_at;

  return (
    <div className="bg-bg text-ink flex min-h-screen flex-col">
      <div data-shell-chrome>
        <PersonaBanner truePersona={truePersona} effectivePersona={effectivePersona} />
        {activeCohortId && (
          <BannerStrip cohortId={activeCohortId} initialBanner={initialBanner} />
        )}
      </div>
      <div className="flex flex-1">
        <div data-shell-chrome className="contents">
          <Sidebar
            caps={caps}
            persona={effectivePersona}
            bannerOffset={false}
            activeCohortId={activeCohortId}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div data-shell-chrome>
            <Topbar
              profile={profile}
              navItems={items}
              cohortName={activeCohortName}
              truePersona={truePersona}
              effectivePersona={effectivePersona}
              activeCohortId={activeCohortId}
            />
          </div>
          <main
            data-shell-main
            className="min-w-0 flex-1 overflow-x-clip px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-8"
          >
            {children}
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <PresentMode />
      </Suspense>
      <TourMount persona={truePersona} initialOpen={initialOpen} />
      {activeCohortId && caps.includes("attendance.self") && (
        <PollPopup cohortId={activeCohortId} initialPoll={initialPoll} />
      )}
    </div>
  );
}
