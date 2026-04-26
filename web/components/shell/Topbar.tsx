import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { NavSearch } from "./NavSearch";
import { CohortSwitcher } from "./CohortSwitcher";
import type { NavItem } from "@/lib/rbac/menus";
import type { UserProfile } from "@/lib/auth/session";

export function Topbar({
  profile,
  navItems,
  cohortName,
}: {
  profile: UserProfile;
  navItems: NavItem[];
  cohortName?: string | null;
}) {
  return (
    <header className="border-line bg-bg/70 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="text-muted text-sm">
          {cohortName ? cohortName : "Dashboard"}
        </span>
        <CohortSwitcher />
      </div>
      <div className="flex items-center gap-3">
        <NavSearch items={navItems} />
        <ThemeToggle />
        <UserMenu email={profile.email} fullName={profile.full_name} />
      </div>
    </header>
  );
}
