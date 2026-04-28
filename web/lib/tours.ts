import type { Persona } from "@/lib/auth/persona";

export interface TourStep {
  /** CSS selector. The tour finds the first match and anchors the tooltip
   *  next to it. Falls back to a centered modal if the element is missing. */
  selector?: string;
  title: string;
  body: string;
}

const STUDENT_TOUR: TourStep[] = [
  {
    title: "Welcome to the workshop",
    body: "30 days, one habit. We'll walk through the seven places you'll spend most of your time. Press → to continue, ← to go back, Esc to skip.",
  },
  {
    selector: 'a[href="/learn"]',
    title: "Daily lesson",
    body: "Today's content unlocks here every morning. Read, build the lab, submit when you're done. Streaks matter more than perfection.",
  },
  {
    selector: 'a[href="/pod"]',
    title: "Your pod",
    body: "A small group of students with assigned faculty. This is where you get accountability, peer review, and live-session breakouts.",
  },
  {
    selector: 'a[href="/community"]',
    title: "Community board",
    body: "Ask questions, share what you built, vote up the best posts. Faster than DMs and helps everyone learn.",
  },
  {
    selector: 'a[href="/help-desk"]',
    title: "Stuck?",
    body: "Open a help-desk ticket — your faculty sees it within the hour during workshop hours. Use this for blockers, not general discussion.",
  },
  {
    selector: 'a[href="/leaderboard"]',
    title: "Leaderboard",
    body: "See where you stand on submissions, quiz scores, posts, and upvotes. Friendly competition; not a gate to anything.",
  },
  {
    selector: 'a[href="/settings/profile"]',
    title: "Your profile",
    body: "Set your full name, college, avatar, and timezone here. You can also change your email if you signed up with the wrong one.",
  },
  {
    title: "You're set",
    body: "Hit “Done” and head to today's lesson. The handbook (in the sidebar later) has more if you want a deeper dive.",
  },
];

const FACULTY_TOUR: TourStep[] = [
  {
    title: "Welcome, faculty",
    body: "Here's the lay of the land before your first cohort day. Press → to continue, ← to go back, Esc to skip.",
  },
  {
    selector: 'a[href="/faculty"]',
    title: "Today",
    body: "Your daily landing page. Live session info, submissions to review, open help-desk tickets — all in one place.",
  },
  {
    selector: 'a[href="/faculty/cohort"]',
    title: "Cohort kanban",
    body: "All pods, all students, all faculty in one view. Drag to reassign, or flip to list view for bulk operations and filtering.",
  },
  {
    selector: 'a[href="/faculty/pod"]',
    title: "Your pod",
    body: "A focused view of just the pod you're assigned to — students, their progress, last activity, at-risk signals.",
  },
  {
    selector: 'a[href="/faculty/help-desk"]',
    title: "Help desk",
    body: "Triage student questions. Anything pod-scoped lands here; tech-only issues escalate to the staff queue automatically.",
  },
  {
    selector: 'a[href="/faculty/handbook"]',
    title: "Handbook",
    body: "Onboarding guide, day-by-day playbook, grading rubric, escalation steps. Bookmark it — that's your daily reference.",
  },
  {
    selector: 'a[href="/settings/profile"]',
    title: "Your profile",
    body: "Set your name, avatar, and email. Your students see your name on every assignment they get reviewed.",
  },
  {
    title: "You're set",
    body: "Hit “Done” and open the handbook for the deep dive. The interactive guide button there will replay this anytime.",
  },
];

const ADMIN_TOUR: TourStep[] = [
  {
    title: "Admin overview",
    body: "You can do everything any persona can, plus the bits below. Press → to continue, ← to go back, Esc to skip.",
  },
  {
    selector: 'a[href="/admin"]',
    title: "Admin home",
    body: "Cohort health at a glance — registrations, attendance, at-risk students, support load. Start here every morning.",
  },
  {
    selector: 'a[href="/admin/invites"]',
    title: "Invites",
    body: "Generate one-time codes for students, faculty, or new admins. Each code is scoped to a kind + cohort and tracked through redemption.",
  },
  {
    selector: 'a[href="/admin/roster"]',
    title: "Roster",
    body: "Everyone in the cohort with capability badges, progress, and direct actions. Source of truth for who's in.",
  },
  {
    selector: 'a[href="/admin/pods"]',
    title: "Pods",
    body: "Same kanban faculty see, with cross-cohort tooling like bulk-reassign and balance checks.",
  },
  {
    selector: 'a[href="/admin/faculty"]',
    title: "Faculty",
    body: "Assign and manage faculty across pods. View their grading load and student coverage at a glance.",
  },
  {
    selector: 'a[href="/admin/schedule"]',
    title: "Schedule",
    body: "Day unlocks, live-session timings, cohort lifecycle (draft → live → archived). Edit dates and content in one place.",
  },
  {
    selector: 'a[href="/admin/handbook"]',
    title: "Admin handbook",
    body: "Lifecycle playbook, security notes, runbooks for common operations. Open it after the tour for the full reference.",
  },
  {
    selector: 'a[href="/settings/profile"]',
    title: "Your profile",
    body: "Set your name, avatar, and email. Don't forget to bootstrap a backup admin before launch.",
  },
  {
    title: "You're set",
    body: "Hit “Done” and open the admin handbook. The interactive guide button there will replay this anytime.",
  },
];

export function tourFor(persona: Persona | null): TourStep[] {
  if (persona === "admin") return ADMIN_TOUR;
  if (persona === "faculty") return FACULTY_TOUR;
  if (persona === "student") return STUDENT_TOUR;
  return [];
}
