import type { Persona } from "@/lib/auth/persona";

export interface TourStep {
  /** Optional pathname. When set, the controller `router.push()`s here
   *  before showing the step, then waits for the selector to mount. */
  path?: string;
  /** CSS selector for the spotlight anchor on the destination page.
   *  Falls back to a centered card if the element doesn't appear in 4s. */
  selector?: string;
  title: string;
  body: string;
}

const STUDENT_TOUR: TourStep[] = [
  {
    title: "Welcome to the workshop",
    body: "30 days, one habit. We'll walk every screen you'll use. Press → to continue, ← to go back, Esc to skip.",
  },
  {
    path: "/learn",
    selector: '[data-tour="day-card"], [data-tour="learn-page"]',
    title: "Daily lesson",
    body: "Today's content unlocks here every morning. Read once, build the lab, submit when you're done. Streaks beat perfection.",
  },
  {
    path: "/pod",
    selector: '[data-tour="pod-page"]',
    title: "Your pod",
    body: "A small group of students with assigned faculty. This is where you get accountability, peer review, and live-session breakouts.",
  },
  {
    path: "/community",
    selector: '[data-tour="community-page"]',
    title: "Community board",
    body: "Ask questions, share what you built, vote up the best posts. Faster than DMs, public so everyone learns.",
  },
  {
    path: "/help-desk",
    selector: '[data-tour="help-desk-page"]',
    title: "Stuck?",
    body: "Open a help-desk ticket — your faculty sees it within the hour during workshop hours. Use it for blockers, not chit-chat.",
  },
  {
    path: "/leaderboard",
    selector: '[data-tour="leaderboard-page"]',
    title: "Leaderboard",
    body: "Where you stand on submissions, quizzes, posts, and upvotes. Friendly competition; not a gate to anything.",
  },
  {
    path: "/handbook",
    selector: '[data-tour="handbook-page"]',
    title: "Handbook",
    body: "Your workshop guide. Replay this tour any time from the Dashboard navigation tab.",
  },
  {
    selector: '[data-tour-target="user-menu"]',
    title: "Your profile",
    body: "Click your avatar (top-right) to update your name, avatar, college, and email. Sign-out lives here too.",
  },
  {
    title: "You're set",
    body: "Hit “Done” and head to today's lesson. The handbook keeps everything within reach.",
  },
];

const FACULTY_TOUR: TourStep[] = [
  {
    title: "Welcome, faculty",
    body: "Here's the lay of the land before your first cohort day. We'll walk to each page and show what's there. Press → to continue, ← back, Esc to skip.",
  },
  {
    path: "/faculty/pod",
    selector: '[data-tour="faculty-pod-page"]',
    title: "Your pod",
    body: "Daily landing surface. Your assigned pod's students, progress, last activity, and at-risk signals at a glance.",
  },
  {
    path: "/faculty/cohort",
    selector: '[data-tour="faculty-cohort-board"]',
    title: "Cohort kanban",
    body: "All pods, all students, all faculty in one view. Drag to reassign. The view toggle (top right) flips to a flat list for bulk operations.",
  },
  {
    path: "/faculty/schedule",
    selector: '[data-tour="faculty-schedule"]',
    title: "Schedule",
    body: "Day-by-day cadence. Live-session times, what's locked vs unlocked, what students are working on today.",
  },
  {
    path: "/faculty/help-desk",
    selector: '[data-tour="faculty-help-desk"]',
    title: "Help desk",
    body: "Triage student questions. Pod-scoped tickets land here; tech-only issues escalate to staff automatically. Keep this tab open during workshop hours.",
  },
  {
    path: "/faculty/handbook",
    selector: '[data-tour="handbook-page"]',
    title: "Handbook",
    body: "Onboarding playbook, day-by-day notes, escalation steps. Bookmark it. The Dashboard navigation tab here replays this tour anytime.",
  },
  {
    selector: '[data-tour-target="user-menu"]',
    title: "Your profile",
    body: "Click your avatar (top-right) to update your name, avatar, and email. Students see your name on every assignment review.",
  },
  {
    title: "You're set",
    body: "Hit “Done”. Open the field channel from the handbook to practice in the sandbox cohort — drag students, grade submissions, post on the board, all without touching real data.",
  },
];

const ADMIN_TOUR: TourStep[] = [
  {
    title: "Admin overview",
    body: "Everything any persona can do, plus the bits below. We'll walk to each page. Press → to continue, ← back, Esc to skip.",
  },
  {
    path: "/admin",
    selector: '[data-tour="admin-home"]',
    title: "Admin home",
    body: "Cohort health at a glance — registrations, attendance, at-risk students, support load. Start your morning here.",
  },
  {
    path: "/admin/invites",
    selector: '[data-tour="admin-invites"]',
    title: "Invites",
    body: "Generate one-time codes for students, faculty, or new admins. Each code is scoped to a kind + cohort and tracked through redemption.",
  },
  {
    path: "/admin/roster",
    selector: '[data-tour="admin-roster"]',
    title: "Roster",
    body: "Everyone in the cohort with capability badges, progress, and direct actions. Source of truth for who's in.",
  },
  {
    path: "/admin/cohorts",
    selector: '[data-tour="admin-cohorts"]',
    title: "Cohorts",
    body: "All cohorts you manage — lifecycle status, enrolment counts, capstone progress. Click in to manage pods, schedule, and content.",
  },
  {
    path: "/admin/schedule",
    selector: '[data-tour="admin-schedule"]',
    title: "Schedule",
    body: "Day unlocks, live-session timings, cohort lifecycle (draft → live → archived). Edit dates and content in one place.",
  },
  {
    path: "/admin/orgs",
    selector: '[data-tour="admin-orgs"]',
    title: "Organizations",
    body: "Partner colleges and how they map to cohorts. Faculty assignments roll up here.",
  },
  {
    path: "/admin/handbook",
    selector: '[data-tour="handbook-page"]',
    title: "Admin handbook",
    body: "Lifecycle playbook, security notes, runbooks. The Dashboard navigation tab replays this tour anytime.",
  },
  {
    selector: '[data-tour-target="user-menu"]',
    title: "Your profile",
    body: "Click your avatar (top-right) to update your name, avatar, and email — and don't forget to bootstrap a backup admin before launch.",
  },
  {
    title: "You're set",
    body: "Hit “Done”. Open the field channel from the handbook to practice in the sandbox cohort with realistic dummy data.",
  },
];

export function tourFor(persona: Persona | null): TourStep[] {
  if (persona === "admin") return ADMIN_TOUR;
  if (persona === "faculty") return FACULTY_TOUR;
  if (persona === "student") return STUDENT_TOUR;
  return [];
}
