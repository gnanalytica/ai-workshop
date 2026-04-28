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
    body: "30 days, one habit. We'll show you the four places you'll spend most of your time. Press → to continue.",
  },
  {
    selector: 'a[href="/learn"]',
    title: "Daily lesson",
    body: "Today's content unlocks here every morning. Submit the lab when you're done — we track streaks, not perfection.",
  },
  {
    selector: 'a[href="/pod"]',
    title: "Your pod",
    body: "Five students, one mentor. This is your group for accountability, peer review, and live sessions.",
  },
  {
    selector: 'a[href="/community"]',
    title: "Community board",
    body: "Ask questions, share what you built, vote on the best posts. Faster than DMs and helps everyone learn.",
  },
  {
    selector: 'a[href="/help-desk"]',
    title: "Stuck?",
    body: "Open a help-desk ticket — your support faculty sees it within the hour during workshop hours.",
  },
];

const FACULTY_TOUR: TourStep[] = [
  {
    title: "Welcome, mentor",
    body: "Here's the lay of the land before your first cohort day. Press → to continue.",
  },
  {
    selector: 'a[href="/faculty"]',
    title: "Today",
    body: "Your daily landing page. Live session info, submissions to review, open help-desk tickets — all in one place.",
  },
  {
    selector: 'a[href="/faculty/cohort"]',
    title: "Cohort kanban",
    body: "All pods, all students, all mentors. Drag to reassign, or flip to list view for bulk operations.",
  },
  {
    selector: 'a[href="/faculty/help-desk"]',
    title: "Help desk",
    body: "Triage student questions. Anything pod-scoped lands here; tech-only issues escalate to the staff queue.",
  },
  {
    selector: 'a[href="/faculty/handbook"]',
    title: "Handbook",
    body: "Onboarding guide, grading rubric, escalation playbook. Bookmark it.",
  },
];

const ADMIN_TOUR: TourStep[] = [
  {
    title: "Admin overview",
    body: "You can do everything any persona can do, plus the bits below. Press → to continue.",
  },
  {
    selector: 'a[href="/admin"]',
    title: "Admin home",
    body: "Cohort health at a glance — registrations, attendance, at-risk students, support load.",
  },
  {
    selector: 'a[href="/admin/invites"]',
    title: "Invites",
    body: "Generate one-time codes for students, faculty, or new admins. Each code is scoped to a kind + cohort.",
  },
  {
    selector: 'a[href="/admin/roster"]',
    title: "Roster",
    body: "Everyone in the cohort with capability badges, progress, and direct actions.",
  },
  {
    selector: 'a[href="/admin/pods"]',
    title: "Pods",
    body: "Same kanban faculty see, with cross-cohort tooling like bulk-reassign and balance checks.",
  },
];

export function tourFor(persona: Persona | null): TourStep[] {
  if (persona === "admin") return ADMIN_TOUR;
  if (persona === "faculty") return FACULTY_TOUR;
  if (persona === "student") return STUDENT_TOUR;
  return [];
}
