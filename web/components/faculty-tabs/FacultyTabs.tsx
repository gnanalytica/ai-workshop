import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "pod" | "cohort";

const TABS: { id: Tab; label: string; href: string }[] = [
  { id: "pod", label: "My Pod", href: "/faculty" },
  { id: "cohort", label: "Cohort", href: "/faculty/cohort" },
];

export function FacultyTabs({ active }: { active: Tab }) {
  return (
    <nav className="border-line/50 flex gap-1 border-b">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
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
