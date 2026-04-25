"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForCaps, type NavGroup } from "@/lib/rbac/menus";

const GROUP_LABELS: Record<NavGroup, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin",
  system: "System",
};

const GROUP_ORDER: readonly NavGroup[] = ["student", "faculty", "admin", "system"];

export function Sidebar({ caps }: { caps: readonly string[] }) {
  const activePath = usePathname() ?? "/";
  const items = navForCaps(caps);
  const grouped = new Map<NavGroup, typeof items>();
  for (const it of items) {
    const arr = grouped.get(it.group) ?? [];
    arr.push(it);
    grouped.set(it.group, arr);
  }

  return (
    <nav className="bg-nav-bg border-line h-full w-60 shrink-0 overflow-y-auto border-r p-4 text-sm">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2">
        <span className="bg-accent inline-block h-3 w-3 rounded-full" />
        <span className="font-semibold tracking-tight">AI Workshop</span>
      </Link>
      {GROUP_ORDER.map((g) => {
        const list = grouped.get(g);
        if (!list?.length) return null;
        return (
          <div key={g} className="mb-5">
            <p className="text-muted mb-2 px-2 text-xs font-medium tracking-widest uppercase">
              {GROUP_LABELS[g]}
            </p>
            <ul className="space-y-0.5">
              {list.map((it) => {
                const active =
                  activePath === it.href ||
                  (it.href !== "/dashboard" && activePath.startsWith(it.href + "/"));
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={
                        "block rounded-md px-2.5 py-1.5 transition-colors " +
                        (active
                          ? "bg-bg-soft text-ink font-medium"
                          : "text-muted hover:bg-bg-soft hover:text-ink")
                      }
                    >
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
