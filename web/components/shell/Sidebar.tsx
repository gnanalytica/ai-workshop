"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navForCaps, type NavGroup } from "@/lib/rbac/menus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<NavGroup, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin",
  system: "System",
};

const GROUP_ORDER: readonly NavGroup[] = ["student", "faculty", "admin", "system"];

export function Sidebar({ caps }: { caps: readonly string[] }) {
  const activePath = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false); // close drawer on route change
  }, [activePath]);

  const items = navForCaps(caps);
  const grouped = new Map<NavGroup, typeof items>();
  for (const it of items) {
    const arr = grouped.get(it.group) ?? [];
    arr.push(it);
    grouped.set(it.group, arr);
  }

  const navContent = (
    <>
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
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 transition-colors",
                        active
                          ? "bg-bg-soft text-ink font-medium"
                          : "text-muted hover:bg-bg-soft hover:text-ink",
                      )}
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
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="fixed top-2 left-2 z-50 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={18} />
      </Button>

      {/* Desktop sidebar */}
      <nav className="bg-nav-bg border-line hidden h-full w-60 shrink-0 overflow-y-auto border-r p-4 text-sm md:block">
        {navContent}
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal>
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="bg-nav-bg border-line absolute top-0 bottom-0 left-0 w-72 overflow-y-auto border-r p-4 text-sm">
            <div className="mb-3 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            {navContent}
          </nav>
        </div>
      )}
    </>
  );
}
