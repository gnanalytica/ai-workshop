/**
 * Static handbook corpus used by the AI help-chat retrieval index.
 *
 * TODO: This duplicates section titles + leading sentences from the handbook
 * pages at `web/app/(authed)/admin/handbook/page.tsx` and
 * `web/app/(authed)/handbook/page.tsx`. Those pages render rich React nodes
 * (TSX `<>` fragments) so we can't statically extract their text without an
 * AST walker. Until we move that copy into a shared text source, keep this
 * file in sync manually when handbook copy changes.
 *
 * The faculty handbook (DB-backed `faculty_pretraining_modules`) is loaded
 * dynamically — see `help-retrieval.ts`.
 */

export interface StaticCorpusEntry {
  /** Stable slug used in citations like `[handbook:slug]`. */
  slug: string;
  /** Persona scope for retrieval filtering. `all` is visible to everyone. */
  persona: "admin" | "faculty" | "student" | "all";
  /** Section title — also weighted in the lexical score. */
  title: string;
  /** Plain-text snippet, ~1–3 sentences, no markup. */
  text: string;
  /** Path the chip should link to when clicked. */
  href: string;
}

export const STATIC_HANDBOOK_CORPUS: StaticCorpusEntry[] = [
  // ---- student handbook ----------------------------------------------------
  {
    slug: "student-what-you-signed-up-for",
    persona: "student",
    title: "What you signed up for",
    text: "30 days, one daily habit. Open today's lesson, build the lab, submit your output, and engage with your pod. Streaks matter more than perfection — a half-finished lab logged on time keeps your streak alive.",
    href: "/handbook?tab=your_role",
  },
  {
    slug: "student-your-pod",
    persona: "student",
    title: "Your pod",
    text: "Your pod is a small group of students plus assigned faculty. Live-session breakouts and peer review of milestones happen here. If you're not in a pod yet, an admin will assign you within 24 hours of enrolment.",
    href: "/handbook?tab=your_role",
  },
  {
    slug: "student-submissions-grading",
    persona: "student",
    title: "Submissions & grading",
    text: "Most days have a submission. Submit early; faculty review in batches twice a day. Late submissions still count toward your streak. Your pod faculty grades — they see context the AI doesn't.",
    href: "/handbook?tab=your_role",
  },
  {
    slug: "student-etiquette",
    persona: "student",
    title: "Etiquette",
    text: "Use the public board for general questions and the help desk for personal blockers. Vote up posts that helped you. Real names and photos — your pod knows you by them.",
    href: "/handbook?tab=your_role",
  },
  {
    slug: "student-setup",
    persona: "student",
    title: "Laptop & browser",
    text: "Any modern laptop with 8GB RAM, latest Chrome/Edge/Firefox, and stable internet for live sessions. Install VS Code (or your editor of choice) before Day 1.",
    href: "/handbook?tab=setup",
  },
  // ---- admin handbook ------------------------------------------------------
  {
    slug: "admin-what-admin-owns",
    persona: "admin",
    title: "What admin owns",
    text: "Admins are the only persona that can change roles, issue invite codes, and edit the cohort schedule. They issue and revoke invite codes, create cohorts, configure days and unlocks, resolve escalated tickets, and run analytics.",
    href: "/admin/handbook?tab=your_role",
  },
  {
    slug: "admin-three-personas",
    persona: "admin",
    title: "Three personas, no overlap",
    text: "The system enforces persona separation in the database. Admin is a global staff role (admin, trainer, or tech_support). Faculty are assigned to one or more cohorts. Students have a confirmed registration in a single cohort.",
    href: "/admin/handbook?tab=your_role",
  },
  {
    slug: "admin-first-bootstrap",
    persona: "admin",
    title: "First admin bootstrap",
    text: "The very first admin can't self-promote. They sign in once via magic link to create a profile row, then a SQL update sets their staff_roles to {'admin'}. Subsequent admins are promoted via staff invite codes.",
    href: "/admin/handbook?tab=your_role",
  },
  {
    slug: "admin-security-checklist",
    persona: "admin",
    title: "Security checklist",
    text: "Keep two admins minimum at all times. Service-role keys never touch client code. Review SECURITY DEFINER functions and RLS policies after any migration. Run supabase/tests/rbac.sql after any role/policy change.",
    href: "/admin/handbook?tab=your_role",
  },
];
