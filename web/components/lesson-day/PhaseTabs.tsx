"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/content/phases";

const VALID_PHASES: ReadonlySet<Phase> = new Set(["pre", "live", "post", "extra"]);

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

  // Listen for cross-component nav requests (e.g. from DayTasksPanel's
  // "What's next" button). Decoupled to avoid lifting tab state up.
  useEffect(() => {
    function onGoto(e: Event) {
      const ce = e as CustomEvent<Phase | string>;
      const next = ce.detail as Phase;
      if (typeof next === "string" && VALID_PHASES.has(next)) {
        select(next);
      }
    }
    window.addEventListener("lesson-day:goto-phase", onGoto as EventListener);
    return () =>
      window.removeEventListener("lesson-day:goto-phase", onGoto as EventListener);
  }, [select]);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/80 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <nav
          role="tablist"
          aria-label="Lesson phase"
          className="border-line bg-card flex gap-1 overflow-x-auto rounded-lg border p-1 shadow-sm"
        >
          {tabs.map((t, i) => {
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
                  "relative flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm",
                  isActive
                    ? "bg-accent text-cta-ink shadow-sm"
                    : "text-muted hover:text-ink hover:bg-bg/60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] tabular-nums",
                    isActive
                      ? "bg-cta-ink/15 text-cta-ink"
                      : "bg-line/60 text-muted",
                  )}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{t.label}</span>
                {t.hint && (
                  <span
                    className={cn(
                      "hidden text-[11px] font-normal lg:inline",
                      isActive ? "text-cta-ink/75" : "text-muted/70",
                    )}
                  >
                    · {t.hint}
                  </span>
                )}
                {t.badge ? (
                  <span
                    className={cn(
                      "ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-cta-ink/20 text-cta-ink"
                        : "bg-accent text-bg",
                    )}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

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
