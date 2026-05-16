"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type PulseTab = "submissions" | "quizzes" | "engagement" | "feedback";

const TABS: { id: PulseTab; label: string; hint: string }[] = [
  { id: "submissions", label: "Submissions", hint: "grades + queue ageing" },
  { id: "quizzes", label: "Quizzes", hint: "attempts + pass rate" },
  { id: "engagement", label: "Engagement", hint: "activity + polls + at-risk" },
  { id: "feedback", label: "Feedback", hint: "ratings + fuzzy topics" },
];

export function PulseTabs({ active }: { active: PulseTab }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Pulse subject">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent/10 text-accent border-accent/40"
                : "border-line text-muted hover:text-ink hover:border-accent/30",
            )}
            title={t.hint}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
