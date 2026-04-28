/**
 * Central route registry. UI copy should never hardcode a pathname inline —
 * import from here so renames stay one-line changes.
 */
export const ROUTES = {
  // Student
  learn: "/learn",
  pod: "/pod",
  community: "/community",
  helpDesk: "/help-desk",
  leaderboard: "/leaderboard",
  handbook: "/handbook",
  certificate: "/certificate",
  showcase: "/showcase",
  profileSettings: "/settings/profile",

  // Faculty
  facultyPod: "/faculty/pod",
  facultyCohort: "/faculty/cohort",
  facultySchedule: "/faculty/schedule",
  facultyHelpDesk: "/faculty/help-desk",
  facultyHelpDeskHistory: "/faculty/help-desk/history",
  facultyHandbook: "/faculty/handbook",
  facultyDayToday: "/faculty/day/today",

  // Admin
  admin: "/admin",
  adminInvites: "/admin/invites",
  adminRoster: "/admin/roster",
  adminPods: "/admin/pods",
  adminCohorts: "/admin/cohorts",
  adminSchedule: "/admin/schedule",
  adminOrgs: "/admin/orgs",
  adminHandbook: "/admin/handbook",

  // Onboarding / public
  signUp: "/start/sign-up",
} as const;

export type RouteKey = keyof typeof ROUTES;
