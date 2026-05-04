import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { NavSearch } from "./NavSearch";
import { CohortSwitcher } from "./CohortSwitcher";
import { PreviewAsSwitcher } from "./PreviewAsSwitcher";
import { MentionInbox } from "./MentionInbox";
import { JoinSession } from "./JoinSession";
import { listUnreadMentions, countUnreadMentions } from "@/lib/queries/notifications";
import { listAllCohorts } from "@/lib/actions/preview-as";
import { getPreviewCohortId, getPreviewUserId } from "@/lib/auth/persona";
import { getSupabaseService } from "@/lib/supabase/service";
import type { NavItem } from "@/lib/rbac/menus";
import type { UserProfile } from "@/lib/auth/session";
import type { Persona } from "@/lib/auth/persona";

export async function Topbar({
  profile,
  navItems,
  cohortName,
  truePersona,
  effectivePersona,
  activeCohortId,
  activeDayNumber,
}: {
  profile: UserProfile;
  navItems: NavItem[];
  cohortName?: string | null;
  truePersona: Persona | null;
  effectivePersona: Persona | null;
  activeCohortId: string | null;
  activeDayNumber: number | null;
}) {
  const isAdminPreviewing =
    truePersona === "admin" && effectivePersona !== null && effectivePersona !== "admin";
  const [unread, mentions] = await Promise.all([countUnreadMentions(), listUnreadMentions(10)]);

  const cohorts = isAdminPreviewing && effectivePersona === "faculty" ? await listAllCohorts() : [];
  const previewCohortId = isAdminPreviewing ? await getPreviewCohortId() : null;
  const previewUserId = isAdminPreviewing ? await getPreviewUserId() : null;
  let previewUserName: string | null = null;
  if (previewUserId) {
    const svc = getSupabaseService();
    const { data } = await svc
      .from("profiles")
      .select("full_name, email")
      .eq("id", previewUserId)
      .maybeSingle();
    const p = data as { full_name: string | null; email: string } | null;
    previewUserName = p ? (p.full_name ?? p.email) : null;
  }

  const roleLabel =
    effectivePersona === "admin"
      ? "Admin Dashboard"
      : effectivePersona === "faculty"
        ? "Faculty Dashboard"
        : effectivePersona === "student"
          ? "Student Dashboard"
          : "Dashboard";

  return (
    <header className="border-hairline bg-bg/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b pr-3 pl-12 backdrop-blur-md sm:pr-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <span className="font-display text-ink truncate text-[17px] leading-none font-medium tracking-tight">
          {roleLabel}
        </span>
        {isAdminPreviewing && (
          // Hidden once PreviewAsSwitcher is on screen (xl+); the switcher's
          // selected option already reads "Faculty (preview)" / "Student (preview)".
          <span className="border-accent/40 bg-accent/10 text-accent rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase xl:hidden">
            Preview · {effectivePersona}
          </span>
        )}
        <div className="hidden lg:block">
          <CohortSwitcher persona={effectivePersona} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {truePersona === "admin" && effectivePersona && (
          <div className="hidden xl:block">
          <PreviewAsSwitcher
            effective={effectivePersona}
            cohorts={cohorts}
            previewCohortId={previewCohortId}
            previewUserId={previewUserId}
            previewUserName={previewUserName}
          />
          </div>
        )}
        <JoinSession
          cohortId={activeCohortId}
          cohortName={cohortName ?? null}
          dayNumber={activeDayNumber}
        />
        <div className="hidden sm:block">
          <NavSearch items={navItems} />
        </div>
        <MentionInbox unread={unread} items={mentions} />
        <ThemeToggle />
        <UserMenu email={profile.email} fullName={profile.full_name} />
      </div>
    </header>
  );
}
