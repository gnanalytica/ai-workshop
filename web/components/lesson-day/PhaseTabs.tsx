"use client";

import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/content/phases";

interface TabDef {
  id: Phase;
  label: string;
  hint?: string;
  badge?: number;
}

export function PhaseTabs({
  initial,
  tabs,
  panels,
}: {
  initial: Phase;
  tabs: TabDef[];
  panels: Record<Phase, ReactNode>;
}) {
  const [active, setActive] = useState<Phase>(initial);

  const select = useCallback((id: Phase) => {
    setActive(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("phase", id);
      window.history.replaceState(null, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div>
      <nav
        role="tablist"
        aria-label="Lesson phase"
        className="border-line/60 sticky top-0 z-10 -mx-6 mb-6 flex gap-1 overflow-x-auto border-b bg-bg/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-bg/70 md:-mx-10 md:px-10"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`phase-panel-${t.id}`}
              id={`phase-tab-${t.id}`}
              onClick={() => select(t.id)}
              className={cn(
                "-mb-px relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-ink"
                  : "text-muted hover:text-ink border-transparent",
              )}
            >
              <span>{t.label}</span>
              {t.hint && (
                <span className="text-muted/70 hidden text-[11px] font-normal sm:inline">
                  · {t.hint}
                </span>
              )}
              {t.badge ? (
                <span className="bg-accent text-bg ml-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 font-mono text-[10px] tabular-nums">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {(Object.keys(panels) as Phase[]).map((id) => (
        <section
          key={id}
          role="tabpanel"
          id={`phase-panel-${id}`}
          aria-labelledby={`phase-tab-${id}`}
          hidden={id !== active}
        >
          {panels[id]}
        </section>
      ))}
    </div>
  );
}
