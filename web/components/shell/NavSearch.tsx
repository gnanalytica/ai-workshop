"use client";

import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NavItem } from "@/lib/rbac/menus";

/**
 * Cmd-K palette. Fuzzy search across nav items the user is allowed to see.
 */
export function NavSearch({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
        className="text-muted border-line bg-bg-soft hover:text-ink inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm"
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
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <Command
            label="Command palette"
            className="bg-card border-line w-full max-w-lg overflow-hidden rounded-lg border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="border-line text-ink placeholder:text-muted h-11 w-full border-b bg-transparent px-4 text-sm focus:outline-none"
            />
            <Command.List className="max-h-72 overflow-y-auto p-2">
              <Command.Empty className="text-muted px-3 py-6 text-center text-sm">
                No matches.
              </Command.Empty>
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
                      className="text-ink data-[selected=true]:bg-bg-soft cursor-pointer rounded-sm px-3 py-2 text-sm"
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
