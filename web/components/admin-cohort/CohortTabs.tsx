import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab =
  | "home"
  | "roster"
  | "schedule"
  | "content"
  | "pods"
  | "grading"
  | "capstones"
  | "polls"
  | "live"
  | "help-desk"
  | "analytics"
  | "health"
  | "milestones";

// Visible tab nav — kept lean. Capstones / Milestones / Polls / Analytics /
// Health remain reachable via direct URL but aren't in the rail; the `Tab`
// union still names them so deep pages can highlight a parent tab.
const TABS: { id: Tab; label: string; href: (c: string) => string }[] = [
  { id: "home", label: "Home", href: (c) => `/admin/cohorts/${c}` },
  { id: "roster", label: "Roster", href: (c) => `/admin/cohorts/${c}/roster` },
  { id: "pods", label: "Pods", href: (c) => `/admin/cohorts/${c}/pods` },
  { id: "schedule", label: "Schedule", href: (c) => `/admin/cohorts/${c}/schedule` },
  { id: "content", label: "Content", href: (c) => `/admin/cohorts/${c}/content` },
  { id: "grading", label: "Submissions", href: (c) => `/admin/cohorts/${c}/grading` },
  { id: "live", label: "Live", href: (c) => `/admin/cohorts/${c}/live` },
  { id: "help-desk", label: "Help desk", href: (c) => `/admin/cohorts/${c}/help-desk` },
];

export function CohortTabs({
  cohortId,
  active,
}: {
  cohortId: string;
  active: Tab;
}) {
  return (
    <nav className="border-line/50 -mx-4 flex gap-1 overflow-x-auto border-b px-4">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href(cohortId)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-accent text-ink"
                : "text-muted hover:text-ink border-transparent",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
