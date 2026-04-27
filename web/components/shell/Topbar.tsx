import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { NavSearch } from "./NavSearch";
import { CohortSwitcher } from "./CohortSwitcher";
import { PreviewAsSwitcher } from "./PreviewAsSwitcher";
import { MentionInbox } from "./MentionInbox";
import { listUnreadMentions, countUnreadMentions } from "@/lib/queries/notifications";
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

  return (
    <header className="border-hairline bg-bg/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-4">
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
        <CohortSwitcher />
      </div>
      <div className="flex items-center gap-2">
        {truePersona === "admin" && effectivePersona && (
          <PreviewAsSwitcher effective={effectivePersona} />
        )}
        <NavSearch items={navItems} />
        <MentionInbox unread={unread} items={mentions} />
        <ThemeToggle />
        <UserMenu email={profile.email} fullName={profile.full_name} />
      </div>
    </header>
  );
}
