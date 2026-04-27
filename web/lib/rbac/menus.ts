import type { Capability } from "./capabilities";

export interface NavItem {
  label: string;
  href: string;
  /** Required cap to see this item; null means always-visible to authenticated users. */
  cap: Capability | null;
  group: NavGroup;
  /** Optional sub-section label inside the group (used by admin nav). */
  section?: string;
  /** Lucide icon name; resolved at render time. */
  icon?: NavIcon;
}

export type NavGroup = "student" | "faculty" | "admin" | "system";

export type NavIcon =
  | "home"
  | "calendar"
  | "book"
  | "users"
  | "user-plus"
  | "user-check"
  | "users-round"
  | "message-square"
  | "history"
  | "trophy"
  | "award"
  | "graduation-cap"
  | "check-square"
  | "vote"
  | "life-buoy"
  | "shield"
  | "bar-chart"
  | "milestone"
  | "activity"
  | "ticket"
  | "building"
  | "layers"
  | "library";

export const NAV: readonly NavItem[] = [
  // ----- Student -----
  { label: "Home",           href: "/learn",        cap: null,           group: "student", icon: "home" },
  { label: "Help desk",     href: "/help-desk",   cap: null,           group: "student", icon: "life-buoy" },
  { label: "Today's Lesson", href: "/day/today",    cap: "content.read", group: "student", icon: "book" },
  { label: "My Pod",         href: "/pod",          cap: null,           group: "student", icon: "users" },
  { label: "Classmates",     href: "/people",       cap: null,           group: "student", icon: "users-round" },
  { label: "Teams",          href: "/teams",        cap: null,           group: "student", icon: "users" },
  { label: "Q&A Board",      href: "/board",        cap: "board.read",   group: "student", icon: "message-square" },
  { label: "Timeline",       href: "/timeline",     cap: null,           group: "student", icon: "history" },
  { label: "Showcase",       href: "/showcase",     cap: null,           group: "student", icon: "trophy" },
  { label: "Certificate",    href: "/certificate",  cap: null,           group: "student", icon: "award" },

  // ----- Faculty -----
  { label: "My Pod",      href: "/faculty",             cap: "roster.read",    group: "faculty", section: "Daily",     icon: "home" },
  { label: "Cohort",      href: "/faculty/cohort",      cap: "roster.read",    group: "faculty", section: "Daily",     icon: "users-round" },
  { label: "Help desk",   href: "/faculty/stuck",       cap: "support.triage", group: "faculty", section: "Daily",     icon: "life-buoy" },
  { label: "Community Board", href: "/board",           cap: "board.read",     group: "faculty", section: "Reference", icon: "message-square" },
  { label: "Leaderboard", href: "/faculty/leaderboard", cap: "roster.read",    group: "faculty", section: "Reference", icon: "trophy" },
  { label: "Handbook",    href: "/faculty/handbook",    cap: "schedule.read",  group: "faculty", section: "Reference", icon: "library" },

  // ----- Admin · Cohort -----
  { label: "Cohort Home", href: "/admin",            cap: "schedule.read",          group: "admin", section: "Cohort", icon: "home" },
  { label: "Schedule",    href: "/admin/schedule",   cap: "schedule.write",         group: "admin", section: "Cohort", icon: "calendar" },
  { label: "Content",     href: "/admin/content",    cap: "content.write",          group: "admin", section: "Cohort", icon: "book" },
  { label: "Roster",      href: "/admin/roster",     cap: "roster.read",            group: "admin", section: "Cohort", icon: "users-round" },
  { label: "Teams",       href: "/admin/teams",      cap: "roster.read",            group: "admin", section: "Cohort", icon: "users" },
  { label: "Pods",        href: "/pods",             cap: "pods.write",             group: "admin", section: "Cohort", icon: "layers" },
  { label: "Faculty",     href: "/admin/faculty",    cap: "faculty.write",          group: "admin", section: "Cohort", icon: "user-check" },
  { label: "Grading",     href: "/admin/grading",    cap: "grading.write:cohort",   group: "admin", section: "Cohort", icon: "check-square" },

  // ----- Admin · Engagement -----
  { label: "Polls",       href: "/admin/polls",      cap: "content.write",          group: "admin", section: "Engagement", icon: "vote" },
  { label: "Help desk",   href: "/admin/stuck",      cap: "support.triage",         group: "admin", section: "Engagement", icon: "life-buoy" },
  { label: "Community Board", href: "/board",        cap: "board.read",             group: "admin", section: "Engagement", icon: "message-square" },
  { label: "Board (Mod)", href: "/admin/board",      cap: "moderation.write",       group: "admin", section: "Engagement", icon: "shield" },

  // ----- Admin · Insights -----
  { label: "Analytics",  href: "/admin/analytics",  cap: "analytics.read:cohort",   group: "admin", section: "Insights", icon: "bar-chart" },
  { label: "Milestones", href: "/admin/milestones", cap: "grading.read",            group: "admin", section: "Insights", icon: "milestone" },
  { label: "Activity",   href: "/admin/activity",   cap: "roster.read",             group: "admin", section: "Insights", icon: "activity" },

  // ----- System (admin only) -----
  { label: "Invites",       href: "/admin/invites", cap: "orgs.write", group: "system", section: "System", icon: "ticket" },
  { label: "Organizations", href: "/admin/orgs",    cap: "orgs.write", group: "system", section: "System", icon: "building" },
];

export function navForCaps(caps: readonly string[]): NavItem[] {
  const has = (c: Capability | null) => c == null || caps.includes(c);
  return NAV.filter((n) => has(n.cap));
}

/**
 * Filter NAV by both capability AND the persona the UI is rendering for.
 * - student persona → only "student" group items
 * - faculty persona → only "faculty" group items
 * - admin persona  → "admin" + "system" groups
 * - null persona   → empty (user has no role yet)
 */
export function navForPersona(
  caps: readonly string[],
  persona: "admin" | "faculty" | "student" | null,
): NavItem[] {
  if (!persona) return [];
  const allowedGroups: Record<typeof persona, NavGroup[]> = {
    admin: ["admin", "system"],
    faculty: ["faculty"],
    student: ["student"],
  };
  const groups = new Set<NavGroup>(allowedGroups[persona]);
  const has = (c: Capability | null) => c == null || caps.includes(c);
  return NAV.filter((n) => groups.has(n.group) && has(n.cap));
}
