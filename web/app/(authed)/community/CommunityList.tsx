"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BoardPostSummary } from "@/lib/queries/community";

type StatusFilter = "all" | "unanswered" | "faq" | "pinned";

export function CommunityList({ posts }: { posts: BoardPostSummary[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) p.tags.forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (status === "unanswered" && p.reply_count > 0) return false;
      if (status === "faq" && !p.is_canonical) return false;
      if (status === "pinned" && !p.pinned_at) return false;
      if (q) {
        const hay = `${p.title} ${p.body_md} ${p.tags.join(" ")} ${p.author_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, query, activeTag, status]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      unanswered: posts.filter((p) => p.reply_count === 0).length,
      faq: posts.filter((p) => p.is_canonical).length,
      pinned: posts.filter((p) => p.pinned_at).length,
    }),
    [posts],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-md sm:flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, body, tag, or author…"
            aria-label="Search community"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { k: "all", label: "All" },
              { k: "unanswered", label: "Unanswered" },
              { k: "faq", label: "FAQ" },
              { k: "pinned", label: "Pinned" },
            ] as Array<{ k: StatusFilter; label: string }>
          ).map((f) => {
            const active = status === f.k;
            return (
              <button
                key={f.k}
                type="button"
                onClick={() => setStatus(f.k)}
                aria-pressed={active}
              >
                <Badge variant={active ? "accent" : "default"} className="cursor-pointer">
                  {f.label}
                  <span className="ml-1.5 opacity-70">{counts[f.k]}</span>
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted text-[11px] tracking-widest uppercase">Tags</span>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "border-line text-muted hover:text-ink rounded-full border px-2.5 py-0.5 text-xs",
              activeTag === null && "border-accent text-accent",
            )}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              className={cn(
                "border-line text-muted hover:text-ink rounded-full border px-2.5 py-0.5 text-xs",
                activeTag === t && "border-accent text-accent bg-accent/10",
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {(query || activeTag || status !== "all") && (
        <p className="text-muted text-xs">
          Showing {filtered.length} of {posts.length}
          {(query || activeTag || status !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setActiveTag(null);
                setStatus("all");
              }}
              className="ml-2"
            >
              Clear
            </Button>
          )}
        </p>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardTitle>No posts match your filters.</CardTitle>
          <CardSub className="mt-2">Try clearing filters or be the first to post.</CardSub>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:border-accent/40 transition-colors">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/community/${p.id}`} className="hover:text-accent">
                  <CardTitle>{p.title}</CardTitle>
                </Link>
                <div className="flex items-center gap-1.5">
                  {p.is_canonical && <Badge variant="ok">FAQ</Badge>}
                  {p.pinned_at && <Badge variant="accent">Pinned</Badge>}
                  {p.reply_count === 0 && <Badge variant="warn">Unanswered</Badge>}
                </div>
              </div>
              <p className="text-ink/85 mt-2 text-sm">
                {p.body_md.slice(0, 200)}
                {p.body_md.length > 200 ? "…" : ""}
              </p>
              <div className="text-muted mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span>{p.author_name ?? "Member"}</span>
                <span>·</span>
                <span>{relTime(p.created_at)}</span>
                <span>·</span>
                <span>
                  {p.reply_count} {p.reply_count === 1 ? "reply" : "replies"}
                </span>
                {p.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTag(t)}
                    className="hover:text-accent"
                  >
                    <Badge>#{t}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
