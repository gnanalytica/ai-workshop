"use client";

import { useMemo, useState } from "react";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import type { HandbookModule } from "@/lib/queries/handbook";
import { HandbookProgress } from "./HandbookProgress";

const STATUS_TONE: Record<NonNullable<HandbookModule["status"]>, "default" | "warn" | "ok"> = {
  not_started: "default",
  in_progress: "warn",
  completed: "ok",
};

type StatusFilter = "all" | "not_started" | "in_progress" | "completed";

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function statusKey(status: HandbookModule["status"]): Exclude<StatusFilter, "all"> {
  return status ?? "not_started";
}

function dotClass(status: HandbookModule["status"]): string {
  const key = statusKey(status);
  if (key === "completed") return "bg-emerald-400";
  if (key === "in_progress") return "bg-amber-400";
  return "bg-muted";
}

export function HandbookView({ modules }: { modules: HandbookModule[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: modules.length,
      not_started: 0,
      in_progress: 0,
      completed: 0,
    };
    for (const m of modules) {
      c[statusKey(m.status)] += 1;
    }
    return c;
  }, [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((m) => {
      if (statusFilter !== "all" && statusKey(m.status) !== statusFilter) return false;
      if (q && !m.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [modules, query, statusFilter]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-sm sm:flex-1">
          <Input
            type="search"
            placeholder="Search modules by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search modules"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                aria-pressed={active}
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] rounded-full"
              >
                <Badge
                  variant={active ? "accent" : "default"}
                  className={
                    active
                      ? "cursor-pointer ring-1 ring-accent/40"
                      : "cursor-pointer hover:bg-bg-soft/80"
                  }
                >
                  {f.label}
                  <span className="ml-1.5 opacity-70">{counts[f.key]}</span>
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-start gap-3">
            <CardSub>No modules match your search and filters.</CardSub>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="hidden lg:sticky lg:top-4 lg:block lg:w-64 lg:shrink-0 lg:self-start">
            <Card className="p-3">
              <p className="text-muted px-2 pb-2 font-mono text-[10px] tracking-widest uppercase">
                On this page
              </p>
              <nav className="flex flex-col">
                {filtered.map((m) => (
                  <a
                    key={m.id}
                    href={`#module-${m.id}`}
                    className="hover:bg-bg-soft text-ink/90 hover:text-ink flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass(m.status)}`}
                    />
                    <span className="text-muted font-mono text-[10px]">
                      {String(m.ordinal).padStart(2, "0")}
                    </span>
                    <span className="truncate">{m.title}</span>
                  </a>
                ))}
              </nav>
            </Card>
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
            {filtered.map((m) => (
              <section
                key={m.id}
                id={`module-${m.id}`}
                className="scroll-mt-20 space-y-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle>
                    <span className="text-muted mr-2 font-mono text-xs">
                      {String(m.ordinal).padStart(2, "0")}
                    </span>
                    {m.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {m.status && (
                      <Badge variant={STATUS_TONE[m.status]}>
                        {m.status.replace("_", " ")}
                      </Badge>
                    )}
                    <HandbookProgress moduleId={m.id} status={m.status} />
                  </div>
                </div>
                <Card className="p-6">
                  {m.body_md ? (
                    <MarkdownView source={m.body_md} />
                  ) : (
                    <CardSub>Module content pending.</CardSub>
                  )}
                </Card>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
