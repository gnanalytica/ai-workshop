import type { Capability } from "./capabilities";

export interface NavItem {
  label: string;
  href: string;
  /** Required cap to see this item; null means always-visible to authenticated users. */
  cap: Capability | null;
  group: NavGroup;
}

export type NavGroup = "student" | "faculty" | "admin" | "system";

export const NAV: readonly NavItem[] = [
  // ----- Student -----
  { label: "Dashboard",        href: "/dashboard",     cap: null,             group: "student" },
  { label: "Today's Lesson",   href: "/day/today",     cap: "content.read",   group: "student" },
  { label: "My Pod",           href: "/pod",           cap: null,             group: "student" },
  { label: "Classmates",       href: "/people",        cap: null,             group: "student" },
  { label: "Teams",            href: "/teams",         cap: null,             group: "student" },
  { label: "Q&A Board",        href: "/board",         cap: "board.read",     group: "student" },
  { label: "Timeline",         href: "/timeline",      cap: null,             group: "student" },
  { label: "Showcase",         href: "/showcase",      cap: null,             group: "student" },
  { label: "Certificate",      href: "/certificate",   cap: null,             group: "student" },

  // ----- Faculty -----
  { label: "Today (Faculty)",  href: "/faculty",          cap: "schedule.read", group: "faculty" },
  { label: "Grading",          href: "/faculty/review",   cap: "grading.read",  group: "faculty" },
  { label: "My Pod",           href: "/faculty/pod",      cap: "roster.read",   group: "faculty" },
  { label: "Faculty Handbook", href: "/faculty/handbook", cap: "schedule.read", group: "faculty" },

  // ----- Admin / Trainer -----
  { label: "Cohort Home",  href: "/admin",            cap: "schedule.read",          group: "admin" },
  { label: "Schedule",     href: "/admin/schedule",   cap: "schedule.write",         group: "admin" },
  { label: "Content",      href: "/admin/content",    cap: "content.write",          group: "admin" },
  { label: "Roster",       href: "/admin/roster",     cap: "roster.read",            group: "admin" },
  { label: "Teams",        href: "/admin/teams",      cap: "roster.read",            group: "admin" },
  { label: "Pods",         href: "/pods",             cap: "pods.write",             group: "admin" },
  { label: "Faculty",      href: "/admin/faculty",    cap: "faculty.write",          group: "admin" },
  { label: "Attendance",   href: "/admin/attendance", cap: "attendance.mark:cohort", group: "admin" },
  { label: "Stuck Queue",  href: "/admin/stuck",      cap: "support.triage",         group: "admin" },
  { label: "Polls",        href: "/admin/polls",      cap: "content.write",          group: "admin" },
  { label: "Board (Mod)",  href: "/admin/board",      cap: "moderation.write",       group: "admin" },
  { label: "Analytics",    href: "/admin/analytics",  cap: "analytics.read:cohort",  group: "admin" },
  { label: "Milestones",   href: "/admin/milestones", cap: "grading.read",           group: "admin" },
  { label: "Activity",     href: "/admin/activity",   cap: "roster.read",            group: "admin" },

  // ----- System (admin only) -----
  { label: "Invites",       href: "/admin/invites", cap: "orgs.write", group: "system" },
  { label: "Organizations", href: "/admin/orgs",    cap: "orgs.write", group: "system" },
];

export function navForCaps(caps: readonly string[]): NavItem[] {
  const has = (c: Capability | null) => c == null || caps.includes(c);
  return NAV.filter((n) => has(n.cap));
}
