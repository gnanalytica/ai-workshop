import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab =
  | "home"
  | "roster"
  | "schedule"
  | "content"
  | "pods"
  | "grading"
  | "polls"
  | "stuck"
  | "analytics"
  | "milestones";

const TABS: { id: Tab; label: string; href: (c: string) => string }[] = [
  { id: "home", label: "Home", href: (c) => `/admin/cohorts/${c}` },
  { id: "roster", label: "Roster", href: (c) => `/admin/cohorts/${c}/roster` },
  { id: "pods", label: "Pods", href: (c) => `/admin/cohorts/${c}/pods` },
  { id: "schedule", label: "Schedule", href: (c) => `/admin/cohorts/${c}/schedule` },
  { id: "content", label: "Content", href: (c) => `/admin/cohorts/${c}/content` },
  { id: "grading", label: "Grading", href: (c) => `/admin/cohorts/${c}/grading` },
  { id: "stuck", label: "Escalations", href: (c) => `/admin/cohorts/${c}/stuck` },
  { id: "polls", label: "Polls", href: (c) => `/admin/cohorts/${c}/polls` },
  { id: "analytics", label: "Analytics", href: (c) => `/admin/cohorts/${c}/analytics` },
  { id: "milestones", label: "Milestones", href: (c) => `/admin/cohorts/${c}/milestones` },
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
