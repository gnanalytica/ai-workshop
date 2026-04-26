"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  BarChart,
  Book,
  Building,
  Calendar,
  CheckSquare,
  GraduationCap,
  History,
  Home,
  Layers,
  Library,
  LifeBuoy,
  type LucideIcon,
  Menu,
  MessageSquare,
  Milestone,
  Shield,
  Ticket,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  Vote,
  X,
} from "lucide-react";
import { navForPersona, type NavIcon, type NavItem } from "@/lib/rbac/menus";
import type { Persona } from "@/lib/auth/persona";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<NavIcon, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  book: Book,
  users: Users,
  "user-plus": UserPlus,
  "user-check": UserCheck,
  "users-round": UsersRound,
  "message-square": MessageSquare,
  history: History,
  trophy: Trophy,
  award: Award,
  "graduation-cap": GraduationCap,
  "check-square": CheckSquare,
  vote: Vote,
  "life-buoy": LifeBuoy,
  shield: Shield,
  "bar-chart": BarChart,
  milestone: Milestone,
  activity: Activity,
  ticket: Ticket,
  building: Building,
  layers: Layers,
  library: Library,
};

export function Sidebar({
  caps,
  persona,
}: {
  caps: readonly string[];
  persona: Persona | null;
}) {
  const activePath = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [activePath]);

  const items = navForPersona(caps, persona);

  // Group by `section` if present (admin), else single bucket.
  const sections = sectionize(items);

  const navContent = (
    <>
      <Link href="/dashboard" className="mb-6 flex items-center gap-2">
        <span className="bg-accent inline-block h-3 w-3 rounded-full" />
        <span className="font-semibold tracking-tight">AI Workshop</span>
      </Link>

      {sections.map(({ name, items }) => (
        <div key={name ?? "_"} className="mb-5">
          {name && (
            <p className="text-muted mb-2 px-2 text-[10px] font-medium tracking-widest uppercase">
              {name}
            </p>
          )}
          <ul className="space-y-0.5">
            {items.map((it) => {
              const Icon = it.icon ? ICONS[it.icon] : null;
              const active =
                activePath === it.href ||
                (it.href !== "/dashboard" && activePath.startsWith(it.href + "/"));
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors",
                      active
                        ? "bg-bg-soft text-ink font-medium"
                        : "text-muted hover:bg-bg-soft hover:text-ink",
                    )}
                  >
                    {Icon && <Icon size={15} className="shrink-0 opacity-80" />}
                    <span>{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="fixed top-2 left-2 z-50 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={18} />
      </Button>

      <nav className="bg-nav-bg border-line hidden h-full w-60 shrink-0 overflow-y-auto border-r p-4 text-sm md:block">
        {navContent}
      </nav>

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

function sectionize(items: NavItem[]): { name: string | null; items: NavItem[] }[] {
  const order: (string | null)[] = [];
  const buckets = new Map<string | null, NavItem[]>();
  for (const it of items) {
    const key = it.section ?? null;
    if (!buckets.has(key)) {
      order.push(key);
      buckets.set(key, []);
    }
    buckets.get(key)!.push(it);
  }
  return order.map((name) => ({ name, items: buckets.get(name)! }));
}
