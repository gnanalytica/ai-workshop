/**
 * Canonical capability list. The TypeScript constants here MUST match the
 * strings produced by the Postgres `auth_caps()` function in
 * `supabase/migrations-v2/0002_helpers.sql`. The two lists are the single
 * source of truth — UI hides actions by capability, RLS enforces them
 * server-side.
 *
 * Adding a capability:
 *  1. Add to CAPABILITIES below.
 *  2. Add to the appropriate role branch in `auth_caps()` SQL.
 *  3. Reference it in policies / pages.
 */
export const CAPABILITIES = [
  "content.read",
  "content.write",
  "schedule.read",
  "schedule.write",
  "roster.read",
  "roster.write",
  "pods.write",
  "faculty.write",
  "grading.read",
  "grading.write:cohort",
  "grading.write:pod",
  "attendance.mark:cohort",
  "attendance.mark:pod",
  "attendance.self",
  "analytics.read:cohort",
  "analytics.read:program",
  "announcements.read:cohort",
  "announcements.write:cohort",
  "moderation.write",
  "support.triage",
  "support.tech_only",
  "orgs.write",
  "self.read",
  "self.write",
  "board.read",
  "board.write",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/** Role identifiers. */
export const ROLES = [
  "admin",
  "trainer",
  "tech_support",
  "support_faculty",
  "executive_faculty",
  "student",
] as const;
export type Role = (typeof ROLES)[number];

/**
 * Static role → capability map, kept in sync with the `auth_caps()` SQL
 * function. Used only for UI hints (sidebar labels, persona switcher);
 * actual gates query the DB-derived caps via `getAuthCaps()`.
 */
export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  admin: [
    "content.read",
    "content.write",
    "schedule.read",
    "schedule.write",
    "roster.read",
    "roster.write",
    "pods.write",
    "faculty.write",
    "grading.read",
    "grading.write:cohort",
    "attendance.mark:cohort",
    "analytics.read:cohort",
    "analytics.read:program",
    "announcements.write:cohort",
    "moderation.write",
    "support.triage",
    "support.tech_only",
    "orgs.write",
  ],
  trainer: [
    "content.read",
    "content.write",
    "schedule.read",
    "schedule.write",
    "roster.read",
    "pods.write",
    "faculty.write",
    "grading.read",
    "grading.write:cohort",
    "attendance.mark:cohort",
    "analytics.read:cohort",
    "announcements.write:cohort",
    "support.triage",
  ],
  tech_support: [
    "content.read",
    "schedule.read",
    "roster.read",
    "support.triage",
    "support.tech_only",
    "moderation.write",
  ],
  support_faculty: [
    "content.read",
    "schedule.read",
    "roster.read",
    "pods.write",
    "grading.read",
    "grading.write:pod",
    "attendance.mark:pod",
    "announcements.read:cohort",
    "support.triage",
  ],
  executive_faculty: [
    "content.read",
    "schedule.read",
    "roster.read",
    "pods.write",
    "grading.read",
    "analytics.read:cohort",
    "announcements.write:cohort",
    "announcements.read:cohort",
  ],
  student: [
    "content.read",
    "schedule.read",
    "self.read",
    "self.write",
    "board.read",
    "board.write",
    "attendance.self",
  ],
};

export function hasCap(caps: readonly string[] | null | undefined, cap: Capability): boolean {
  return !!caps?.includes(cap);
}

/** Convenience: any of the listed caps. */
export function hasAnyCap(
  caps: readonly string[] | null | undefined,
  ...candidates: Capability[]
): boolean {
  return !!caps?.some((c) => candidates.includes(c as Capability));
}
