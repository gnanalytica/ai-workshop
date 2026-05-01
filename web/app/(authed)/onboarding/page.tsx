import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  LifeBuoy,
  Library,
  type LucideIcon,
  MessageSquare,
  Milestone,
  PenLine,
  Send,
  Settings,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
  UsersRound,
  Video,
} from "lucide-react";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/session";
import { getEffectivePersona } from "@/lib/auth/persona";
import { markOnboarded } from "@/lib/actions/profile";

interface ExploreCard {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  /** External app route vs. an in-page hint (e.g. "topbar Join button"). */
  external?: boolean;
}

const STUDENT_CARDS: ExploreCard[] = [
  {
    title: "Update your profile",
    description:
      "Add your photo, college, and a short bio so your pod and faculty can recognize you.",
    href: "/settings/profile",
    cta: "Edit profile",
    icon: UserCircle,
  },
  {
    title: "Find your pod",
    description:
      "Your pod is a small group of classmates with one primary faculty mentor. Say hi.",
    href: "/pod",
    cta: "Open my pod",
    icon: Users,
  },
  {
    title: "Meet your classmates",
    description:
      "Browse the whole cohort, send kudos, and discover who's in other pods.",
    href: "/people",
    cta: "Open classmates",
    icon: UsersRound,
  },
  {
    title: "Open today's lesson",
    description:
      "Your daily lesson has Pre-class, In-class, Post-class, and References tabs. Start here every day.",
    href: "/day/today",
    cta: "Open today",
    icon: BookOpen,
  },
  {
    title: "Try the community",
    description:
      "Ask questions, share wins, and answer classmates. Mentions notify the right people.",
    href: "/community",
    cta: "Open community",
    icon: MessageSquare,
  },
  {
    title: "Check the leaderboard",
    description:
      "See your rank by attendance, submissions, quiz scores, and kudos.",
    href: "/leaderboard",
    cta: "Open leaderboard",
    icon: Trophy,
  },
  {
    title: "How to get help",
    description:
      "Stuck? Raise a tech, content, or team request — your pod faculty sees it first, with escalation to staff if needed.",
    href: "/help-desk",
    cta: "Open help desk",
    icon: LifeBuoy,
  },
  {
    title: "Read the student handbook",
    description:
      "How attendance works, how grading works, what your capstone is. Bookmark it.",
    href: "/handbook",
    cta: "Open handbook",
    icon: Library,
  },
];

const FACULTY_CARDS: ExploreCard[] = [
  {
    title: "What is a pod?",
    description:
      "A pod is a small group of students under one primary faculty. You see your pod's submissions, attendance, and at-risk signals.",
    href: "/faculty/handbook",
    cta: "Read in handbook",
    icon: Compass,
  },
  {
    title: "See your pod",
    description:
      "Your pod's roster, daily attendance, and submissions. Start every day here.",
    href: "/faculty/pod",
    cta: "Open my pod",
    icon: Users,
  },
  {
    title: "Full cohort roster",
    description:
      "Everyone in your cohort, grouped by pod. Useful for context, but your pod is your home base.",
    href: "/faculty/cohort",
    cta: "Open cohort",
    icon: UsersRound,
  },
  {
    title: "Update today's live link",
    description:
      "Use the Join live button in the topbar — click the pencil to set or replace the link. Students see your update next refresh.",
    href: "/faculty/schedule",
    cta: "Open schedule",
    icon: Video,
  },
  {
    title: "How to review submissions",
    description:
      "Faculty are review-only on grades — admins write the final grade. Your read helps spot at-risk students early.",
    href: "/faculty/handbook",
    cta: "Read in handbook",
    icon: PenLine,
  },
  {
    title: "Help-desk queue",
    description:
      "Tickets from your pod show first. Claim, reply, or escalate to staff if it's beyond your scope.",
    href: "/faculty/help-desk",
    cta: "Open help desk",
    icon: LifeBuoy,
  },
  {
    title: "Pod notes",
    description:
      "Private observations on a student — only you and other faculty for your pod see them. Open any student page from your pod roster.",
    href: "/faculty/pod",
    cta: "Open my pod",
    icon: Send,
  },
  {
    title: "Try the demo cohort",
    description:
      "A sandbox cohort with fake students. Try anything — grading, pod ops, ticket triage — without affecting real students.",
    href: "/faculty/handbook",
    cta: "Read in handbook",
    icon: GraduationCap,
  },
];

const ADMIN_CARDS: ExploreCard[] = [
  {
    title: "Create a new cohort",
    description:
      "Click New cohort on the admin home, fill slug + name + start date. The 30-day curriculum auto-seeds.",
    href: "/admin",
    cta: "Open admin home",
    icon: Milestone,
  },
  {
    title: "Invite faculty / staff",
    description:
      "Generate scoped invite codes. Faculty invites are pinned to a cohort; staff invites are global.",
    href: "/admin/invites",
    cta: "Open invites",
    icon: Award,
  },
  {
    title: "Manage pods + primary faculty",
    description:
      "Create pods, assign exactly one primary faculty per pod, and move students between pods.",
    href: "/admin",
    cta: "Open admin",
    icon: Users,
  },
  {
    title: "Help-desk queue (all cohorts)",
    description:
      "Triage across cohorts. Faculty handle pod-scoped tickets first; staff and tech pick up escalations.",
    href: "/admin/help-desk",
    cta: "Open help desk",
    icon: LifeBuoy,
  },
  {
    title: "Cohort analytics",
    description:
      "At-risk students, attendance trends, submission rates. Open a cohort to drill in.",
    href: "/admin",
    cta: "Open analytics",
    icon: Trophy,
  },
  {
    title: "Lesson content + lock state",
    description:
      "Each cohort has its own day-by-day lock. Unlock days as the cohort progresses.",
    href: "/admin",
    cta: "Open content",
    icon: BookOpen,
  },
];

export default async function OnboardingPage() {
  const profile = await getProfile();
  const persona = (await getEffectivePersona()) ?? "student";
  const cards =
    persona === "admin"
      ? ADMIN_CARDS
      : persona === "faculty"
        ? FACULTY_CARDS
        : STUDENT_CARDS;

  const intro =
    persona === "admin"
      ? "You're running the workshop. Here are the controls you'll touch most."
      : persona === "faculty"
        ? "You're mentoring a pod. Here's how the platform supports you day-to-day."
        : "Welcome to the workshop. Take five minutes to look around — you'll move faster all month.";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
          <Sparkles size={12} strokeWidth={2.4} />
          Day 0 · Welcome
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Hi {firstName(profile?.full_name)} — let&apos;s get you set up
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">{intro}</p>
        {profile && !profile.onboarded_at && (
          <form action={markOnboarded} className="mt-5">
            <Button type="submit" variant="outline" size="sm">
              <CheckCircle2 size={14} strokeWidth={2.2} className="mr-1.5" />
              Mark onboarding complete
            </Button>
          </form>
        )}
        {profile?.onboarded_at && (
          <div className="border-ok/40 bg-ok/5 mt-5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
            <CheckCircle2 size={13} strokeWidth={2.2} className="text-ok" />
            <span className="text-ink/85">Onboarding complete — revisit any time.</span>
          </div>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <ExploreTile key={c.title} card={c} />
        ))}
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardSub className="text-accent font-mono text-[10px] tracking-widest uppercase">
          Tip
        </CardSub>
        <CardTitle className="mt-1 text-base">Ask Sage anything</CardTitle>
        <p className="text-ink/85 mt-2 text-sm leading-6">
          Click <span className="font-medium">Ask Sage</span> at the bottom-right of any page. Sage knows
          where things live, how to do common actions, and points you to the handbook section that backs
          its answer.
        </p>
      </Card>
    </div>
  );
}

function ExploreTile({ card }: { card: ExploreCard }) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="
        group border-line bg-card hover:border-accent/55 hover:bg-accent/5
        flex h-full flex-col gap-3 rounded-lg border p-4
        transition-colors
      "
    >
      <div className="flex items-center justify-between">
        <span className="bg-accent/10 text-accent inline-flex h-9 w-9 items-center justify-center rounded-full">
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="text-muted/70 group-hover:text-accent text-[10px] font-medium uppercase tracking-[0.18em] transition-colors">
          {card.cta} →
        </span>
      </div>
      <div>
        <p className="text-ink text-[14px] font-semibold tracking-tight">{card.title}</p>
        <p className="text-muted mt-1.5 text-[12.5px] leading-relaxed">{card.description}</p>
      </div>
    </Link>
  );
}

function firstName(full: string | null | undefined): string {
  if (!full) return "there";
  const first = full.trim().split(/\s+/)[0];
  return first || "there";
}
