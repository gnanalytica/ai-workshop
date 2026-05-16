"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type PulseWindow = 7 | 14 | 30 | "all";

const WINDOWS: { value: PulseWindow; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
  { value: "all", label: "All" },
];

export function PulseWindowPicker({ active }: { active: PulseWindow }) {
  const pathname = usePathname();
  const sp = useSearchParams();

  // Build hrefs that preserve any other query params (e.g. ?tab=quizzes).
  const buildHref = (value: PulseWindow) => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("window", String(value));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        Window
      </span>
      <div className="border-line bg-card inline-flex overflow-hidden rounded-md border">
        {WINDOWS.map((w, i) => {
          const isActive = w.value === active;
          return (
            <Link
              key={String(w.value)}
              href={buildHref(w.value)}
              scroll={false}
              className={cn(
                "px-2 py-1 text-xs font-medium transition-colors",
                i > 0 && "border-line border-l",
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-ink hover:bg-bg-soft/60",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {w.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function parseWindow(raw: string | undefined): PulseWindow {
  if (raw === "14" || raw === "30") return Number(raw) as PulseWindow;
  if (raw === "all") return "all";
  return 7;
}
