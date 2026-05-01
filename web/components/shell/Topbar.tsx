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
}: {
  profile: UserProfile;
  navItems: NavItem[];
  cohortName?: string | null;
  truePersona: Persona | null;
  effectivePersona: Persona | null;
}) {
  const isAdminPreviewing =
    truePersona === "admin" && effectivePersona !== null && effectivePersona !== "admin";
  const [unread, mentions] = await Promise.all([countUnreadMentions(), listUnreadMentions(10)]);

  const cohorts = isAdminPreviewing && effectivePersona === "faculty" ? await listAllCohorts() : [];
  const previewCohortId = isAdminPreviewing ? await getPreviewCohortId() : null;
  const previewUserId = isAdminPreviewing ? await getPreviewUserId() : null;
  let previewCohortName: string | null = null;
  let previewUserName: string | null = null;
  if (previewCohortId) {
    previewCohortName = cohorts.find((c) => c.id === previewCohortId)?.name ?? null;
  }
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

  return (
    <header className="border-hairline bg-bg/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-3 backdrop-blur-md sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {cohortName ? (
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="eyebrow">Cohort</span>
            <span className="font-display text-ink truncate text-[17px] leading-none font-medium tracking-tight">
              {cohortName}
            </span>
          </div>
        ) : (
          <span className="font-display text-ink text-[17px] leading-none font-medium tracking-tight">
            Dashboard
          </span>
        )}
        {isAdminPreviewing && (
          <span className="border-accent/40 bg-accent/10 text-accent rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase">
            Preview · {effectivePersona}
          </span>
        )}
        <div className="hidden lg:block">
          <CohortSwitcher />
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {truePersona === "admin" && effectivePersona && (
          <div className="hidden xl:block">
          <PreviewAsSwitcher
            effective={effectivePersona}
            cohorts={cohorts}
            previewCohortId={previewCohortId}
            previewCohortName={previewCohortName}
            previewUserId={previewUserId}
            previewUserName={previewUserName}
          />
          </div>
        )}
        <JoinSession />
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
