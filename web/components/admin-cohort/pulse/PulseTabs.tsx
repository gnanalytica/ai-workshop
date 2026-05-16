"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type PulseTab = "class" | "pods" | "students";

const TABS: { id: PulseTab; label: string; hint: string }[] = [
  { id: "class", label: "Class", hint: "cohort-wide pulse" },
  { id: "pods", label: "Pods", hint: "per-pod breakdown" },
  { id: "students", label: "Students", hint: "per-student breakdown" },
];

export function PulseTabs({ active }: { active: PulseTab }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Pulse views">
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
