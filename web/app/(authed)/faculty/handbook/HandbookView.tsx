"use client";

import { useMemo, useState } from "react";
import { BookMarked, ListFilter, Search } from "lucide-react";
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
  { key: "completed", label: "Done" },
];

function statusKey(status: HandbookModule["status"]): Exclude<StatusFilter, "all"> {
  return status ?? "not_started";
}

function dotClass(status: HandbookModule["status"]): string {
  const key = statusKey(status);
  if (key === "completed") return "bg-emerald-500 ring-1 ring-emerald-500/30";
  if (key === "in_progress") return "bg-amber-500 ring-1 ring-amber-500/30";
  return "bg-muted ring-1 ring-line/50";
}

export function HandbookView({ modules }: { modules: HandbookModule[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openPicker, setOpenPicker] = useState("");

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
    <div className="space-y-8">
      <div className="border-hairline bg-bg-soft/30 flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
        <div className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase">
          In this section
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <label className="group relative min-w-0 flex-1">
            <span className="sr-only">Search modules by title</span>
            <Search
              className="text-muted group-focus-within:text-accent pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors"
              strokeWidth={1.75}
            />
            <Input
              type="search"
              placeholder="Filter by title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-hairline focus-visible:border-accent/40 focus-visible:ring-accent/20 h-11 rounded-xl pl-10 pr-3"
              aria-label="Search modules by title"
            />
          </label>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-muted flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-wide uppercase sm:pl-1">
              <ListFilter className="h-3.5 w-3.5" />
              Status
            </span>
            <div className="bg-bg/80 flex flex-wrap gap-1 rounded-lg p-1 sm:max-w-xl">
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    aria-pressed={active}
                    className="focus-visible:outline-accent rounded-md focus-visible:outline-2 focus-visible:outline-offset-1"
                  >
                    <span
                      className={`font-mono text-[10px] tabular transition-colors ${
                        active
                          ? "bg-card text-ink border-line shadow-soft inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5"
                          : "text-muted hover:text-ink/90 inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-2.5 py-1.5"
                      } `}
                    >
                      {f.label}
                      <span
                        className={
                          active
                            ? "text-muted"
                            : "text-muted/80"
                        }
                      >
                        {counts[f.key]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed p-8 text-center sm:p-10">
          <div className="text-muted font-mono text-[10px] tracking-widest uppercase">No results</div>
          <p className="text-ink/90 mt-2 text-sm">No modules match your search and filters.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Mobile: jump to module */}
          <div className="lg:hidden">
            <label className="text-muted mb-2 flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
              <BookMarked className="h-3.5 w-3.5" />
              Jump to
            </label>
            <select
              className="border-line bg-card text-ink focus:border-accent/50 w-full cursor-pointer rounded-xl border py-2.5 pl-3 pr-3 text-sm font-medium"
              value={openPicker}
              onChange={(e) => {
                const v = e.target.value;
                setOpenPicker(v);
                if (v) {
                  const el = document.getElementById(v);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              <option value="">Choose a module…</option>
              {filtered.map((m) => (
                <option key={m.id} value={`module-${m.id}`}>
                  {String(m.ordinal).padStart(2, "0")} — {m.title}
                </option>
              ))}
            </select>
          </div>

          <aside className="hidden w-64 shrink-0 lg:sticky lg:top-4 lg:block lg:self-start">
            <div className="border-hairline from-card/95 to-bg-soft/20 shadow-soft rounded-2xl border bg-gradient-to-b p-1">
              <div className="text-muted p-3 pb-2 font-mono text-[10px] tracking-[0.2em] uppercase">
                Contents
              </div>
              <nav className="flex max-h-[min(60vh,28rem)] flex-col gap-0.5 overflow-y-auto p-1 pr-1">
                {filtered.map((m) => (
                  <a
                    key={m.id}
                    href={`#module-${m.id}`}
                    className="text-ink/85 hover:text-ink group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-bg-soft/80"
                  >
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${dotClass(m.status)} transition-transform group-hover:scale-110`}
                    />
                    <span className="text-muted/90 font-mono text-[9px] tabular group-hover:text-muted">
                      {String(m.ordinal).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug [text-wrap:balance] group-hover:underline group-hover:decoration-hairline group-hover:underline-offset-2">
                      {m.title}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-10">
            {filtered.map((m, i) => (
              <section
                key={m.id}
                id={`module-${m.id}`}
                style={{ animationDelay: `${60 + i * 45}ms` }}
                className="handbook-section-in scroll-mt-24"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-muted font-mono text-[10px] tracking-widest uppercase">
                      Module
                    </p>
                    <CardTitle className="font-display text-ink mt-1.5 text-2xl font-semibold leading-tight [font-variation-settings:'opsz'60] sm:text-[1.65rem]">
                      <span className="text-muted/80 mr-2 font-mono text-xs tabular not-italic">
                        {String(m.ordinal).padStart(2, "0")}
                      </span>
                      {m.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {m.status && (
                      <Badge variant={STATUS_TONE[m.status]}>
                        {m.status === "completed" ? "Done" : m.status.replace("_", " ")}
                      </Badge>
                    )}
                    <HandbookProgress moduleId={m.id} status={m.status} />
                  </div>
                </div>

                <div className="border-hairline from-card/98 to-bg-soft/10 shadow-lift group/card relative overflow-hidden rounded-2xl border bg-gradient-to-b">
                  <div
                    className="from-accent/25 via-accent/10 to-transparent h-[3px] w-full bg-gradient-to-r"
                    aria-hidden
                  />
                  <div className="p-5 sm:p-7 md:p-8">
                    {m.body_md ? (
                      <MarkdownView source={m.body_md} variant="handbook" />
                    ) : (
                      <CardSub>Module content pending.</CardSub>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
