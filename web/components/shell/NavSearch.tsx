"use client";

import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NavItem } from "@/lib/rbac/menus";

interface RemoteHit {
  kind: "person" | "post" | "day";
  href: string;
  title: string;
  hint?: string;
}

export function NavSearch({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<RemoteHit[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setRemote([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!r.ok) return;
        const j = (await r.json()) as { hits: RemoteHit[] };
        setRemote(j.hits ?? []);
      } catch {
        /* ignored */
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => {
    const m = new Map<string, NavItem[]>();
    for (const it of items) {
      const arr = m.get(it.group) ?? [];
      arr.push(it);
      m.set(it.group, arr);
    }
    return m;
  }, [items]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted border-line bg-bg-soft hover:text-ink hover:border-accent/30 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
      >
        <Search size={14} />
        <span>Search</span>
        <kbd className="bg-card border-line ml-2 rounded border px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-3 pt-[12vh] sm:px-4 sm:pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <Command
            label="Command palette"
            className="bg-card border-line w-full max-w-lg overflow-hidden rounded-lg border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search nav, classmates, posts, days…"
              className="border-line text-ink placeholder:text-muted h-11 w-full border-b bg-transparent px-4 text-sm focus:outline-none"
            />
            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty className="text-muted px-3 py-6 text-center text-sm">
                No matches.
              </Command.Empty>
              {remote.length > 0 && (
                <Command.Group
                  heading="results"
                  className="text-muted px-2 pt-2 pb-1 text-xs uppercase"
                >
                  {remote.map((h, i) => (
                    <Command.Item
                      key={`${h.kind}-${h.href}-${i}`}
                      value={`${h.kind} ${h.title} ${h.hint ?? ""}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(h.href);
                      }}
                      className="text-ink data-[selected=true]:bg-bg-soft flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm transition-colors duration-200 ease-out"
                    >
                      <span>
                        <span className="text-muted mr-2 font-mono text-[10px] uppercase">
                          {h.kind}
                        </span>
                        {h.title}
                      </span>
                      {h.hint && <span className="text-muted text-xs">{h.hint}</span>}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {[...groups.entries()].map(([group, list]) => (
                <Command.Group
                  key={group}
                  heading={group}
                  className="text-muted px-2 pt-2 pb-1 text-xs uppercase"
                >
                  {list.map((it) => (
                    <Command.Item
                      key={it.href}
                      value={`${it.group} ${it.label}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(it.href);
                      }}
                      className="text-ink data-[selected=true]:bg-bg-soft cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors duration-200 ease-out"
                    >
                      {it.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
