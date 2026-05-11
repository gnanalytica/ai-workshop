"use client";

import { useMemo, useState } from "react";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { relTime } from "@/lib/format";
import type {
  FuzzyTopicEntry,
  LowRatingEntry,
} from "@/lib/queries/day-feedback";

type Tab = "all" | "low";

export function AdminFeedbackBrowser({
  fuzzyTopics,
  lowRating,
}: {
  fuzzyTopics: FuzzyTopicEntry[];
  lowRating: LowRatingEntry[];
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<number | "all">("all");
  const [minRating, setMinRating] = useState<number | "all">("all");

  const days = useMemo(() => {
    const set = new Set<number>();
    for (const e of fuzzyTopics) set.add(e.day_number);
    for (const e of lowRating) set.add(e.day_number);
    return Array.from(set).sort((a, b) => a - b);
  }, [fuzzyTopics, lowRating]);

  const filteredFuzzy = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fuzzyTopics.filter((e) => {
      if (day !== "all" && e.day_number !== day) return false;
      if (minRating !== "all" && e.rating < minRating) return false;
      if (!q) return true;
      return (
        e.text.toLowerCase().includes(q) ||
        (e.full_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [fuzzyTopics, query, day, minRating]);

  const filteredLow = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lowRating.filter((e) => {
      if (day !== "all" && e.day_number !== day) return false;
      if (!q) return true;
      return (
        (e.fuzzy_topic ?? "").toLowerCase().includes(q) ||
        (e.full_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [lowRating, query, day]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-line/60 inline-flex overflow-hidden rounded-md border text-xs">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={
              "px-3 py-1.5 font-medium " +
              (tab === "all"
                ? "bg-accent/15 text-ink"
                : "text-muted hover:text-ink")
            }
          >
            All comments ({fuzzyTopics.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("low")}
            className={
              "border-line/60 border-l px-3 py-1.5 font-medium " +
              (tab === "low"
                ? "bg-accent/15 text-ink"
                : "text-muted hover:text-ink")
            }
          >
            Low ratings ({lowRating.length})
          </button>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search text or name…"
          className="h-8 max-w-xs text-xs"
        />

        <select
          value={day === "all" ? "all" : String(day)}
          onChange={(e) =>
            setDay(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="border-line/60 bg-bg text-ink h-8 rounded-md border px-2 text-xs"
        >
          <option value="all">All days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              Day {d}
            </option>
          ))}
        </select>

        {tab === "all" && (
          <select
            value={minRating === "all" ? "all" : String(minRating)}
            onChange={(e) =>
              setMinRating(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="border-line/60 bg-bg text-ink h-8 rounded-md border px-2 text-xs"
          >
            <option value="all">Any rating</option>
            <option value="1">≥ 1★</option>
            <option value="2">≥ 2★</option>
            <option value="3">≥ 3★</option>
            <option value="4">≥ 4★</option>
            <option value="5">5★ only</option>
          </select>
        )}
      </div>

      {tab === "all" ? (
        <FuzzyList entries={filteredFuzzy} />
      ) : (
        <LowList entries={filteredLow} />
      )}
    </div>
  );
}

function FuzzyList({ entries }: { entries: FuzzyTopicEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardSub>No comments match these filters.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 max-h-[640px] divide-y overflow-y-auto">
        {entries.map((e, i) => (
          <li key={i} className="flex items-baseline gap-3 px-5 py-3 text-sm">
            <span className="text-muted shrink-0 w-12 font-mono text-[10.5px] uppercase tracking-[0.16em]">
              D{String(e.day_number).padStart(2, "0")}
            </span>
            <Badge
              variant={
                e.rating >= 4 ? "ok" : e.rating >= 3 ? "warn" : "danger"
              }
            >
              {e.rating}★
            </Badge>
            <p className="text-ink/90 min-w-0 flex-1 break-words whitespace-pre-wrap">
              {e.text}
            </p>
            <span className="text-muted shrink-0 text-xs">
              {e.full_name ?? "anonymous"} · {relTime(e.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function LowList({ entries }: { entries: LowRatingEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardSub>No low ratings match these filters.</CardSub>
      </Card>
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-line/50 max-h-[640px] divide-y overflow-y-auto">
        {entries.map((e, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-3 px-5 py-3 text-sm">
            <span className="text-muted shrink-0 w-12 font-mono text-[10.5px] uppercase tracking-[0.16em]">
              D{String(e.day_number).padStart(2, "0")}
            </span>
            <Badge variant={e.rating === 1 ? "danger" : "warn"}>
              {e.rating}★
            </Badge>
            <div className="min-w-0 flex-1">
              {e.fuzzy_topic && (
                <p className="text-ink/90 break-words italic">
                  &ldquo;{e.fuzzy_topic}&rdquo;
                </p>
              )}
              <p className="text-muted mt-0.5 text-xs">
                {e.user_id && e.full_name ? (
                  <span>{e.full_name}</span>
                ) : (
                  <span>{e.anonymous ? "anonymous" : "unknown"}</span>
                )}
                {" · "}
                {relTime(e.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
