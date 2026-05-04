import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab =
  | "home"
  | "roster"
  | "curriculum"
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

const TABS: { id: Tab; label: string; href: (c: string) => string }[] = [
  { id: "home", label: "Home", href: (c) => `/admin/cohorts/${c}` },
  { id: "roster", label: "Roster", href: (c) => `/admin/cohorts/${c}/roster` },
  { id: "pods", label: "Pods", href: (c) => `/admin/cohorts/${c}/pods` },
  { id: "curriculum", label: "Curriculum", href: (c) => `/admin/cohorts/${c}/curriculum` },
  { id: "grading", label: "Submissions", href: (c) => `/admin/cohorts/${c}/grading` },
  { id: "analytics", label: "Analytics", href: (c) => `/admin/cohorts/${c}/analytics` },
  { id: "health", label: "Health", href: (c) => `/admin/cohorts/${c}/health` },
  { id: "live", label: "Live", href: (c) => `/admin/cohorts/${c}/live` },
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
        // Treat the merged Curriculum tab as active when the underlying
        // legacy schedule/content routes are shown (deep day editor etc.).
        const isActive =
          t.id === active ||
          (t.id === "curriculum" && (active === "schedule" || active === "content"));
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
