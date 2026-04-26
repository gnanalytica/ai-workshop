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
    <header className="border-line bg-bg/70 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="text-muted text-sm">
          {cohortName ? cohortName : "Dashboard"}
        </span>
        {isAdminPreviewing && (
          <span className="bg-warn/10 text-warn rounded-md px-2 py-0.5 text-xs font-medium tracking-wide uppercase">
            Previewing as {effectivePersona}
          </span>
        )}
        <CohortSwitcher />
      </div>
      <div className="flex items-center gap-3">
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
