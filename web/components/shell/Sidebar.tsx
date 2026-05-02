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
  ChevronsLeft,
  ChevronsRight,
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

const PINNED_KEY = "shell.sidebar.pinned";

export function Sidebar({
  caps,
  persona,
}: {
  caps: readonly string[];
  persona: Persona | null;
}) {
  const activePath = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => setDrawerOpen(false), [activePath]);

  useEffect(() => {
    try {
      setPinned(window.localStorage.getItem(PINNED_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const togglePin = () => {
    setPinned((p) => {
      const next = !p;
      try {
        window.localStorage.setItem(PINNED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const items = navForPersona(caps, persona);
  const sections = sectionize(items);
  const expanded = pinned || hovered;

  return (
    <>
      {/* Mobile: burger trigger — sits inside the Topbar's reserved left slot
          (Topbar adds pl-12 on <md). Fixed so it stays accessible when the
          page scrolls under the sticky topbar. 44px hit target. */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="fixed top-1.5 left-1.5 z-50 h-11 w-11 md:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={20} />
      </Button>

      {/* Desktop rail — fixed 64px width that owns the layout column.
          A floating drawer expands ON TOP of content when hovered/pinned, so
          the page doesn't reflow. Subtle, premium. */}
      <div className="relative hidden shrink-0 md:block" style={{ width: 64 }}>
        <nav
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "bg-nav-bg border-hairline fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-[width,box-shadow] duration-200 ease-out",
            expanded ? "shadow-lift" : "",
          )}
          style={{ width: expanded ? 248 : 64 }}
        >
          {/* Brand mark — terracotta dot, serif wordmark when expanded */}
          <Link
            href="/dashboard"
            className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-[22px]"
            aria-label="AI Workshop home"
          >
            <span className="bg-accent inline-block h-2.5 w-2.5 shrink-0 rounded-full" />
            <span
              className={cn(
                "font-display text-[17px] leading-none font-medium tracking-tight whitespace-nowrap transition-opacity",
                expanded ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              AI Workshop
            </span>
          </Link>

          <div className="flex-1 overflow-x-hidden overflow-y-auto py-3">
            {sections.map(({ name, items }, i) => (
              <div key={name ?? `_${i}`} className={cn("px-3", i > 0 && "mt-4")}>
                {name && (
                  <p
                    className={cn(
                      "eyebrow mb-2 px-2 transition-opacity",
                      expanded ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                  >
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
                          title={!expanded ? it.label : undefined}
                          className={cn(
                            "group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[13px] transition-all duration-200 ease-out",
                            active
                              ? "text-ink"
                              : "text-muted hover:text-ink hover:bg-bg-soft",
                          )}
                        >
                          {/* Active accent — thin terracotta bar at the left edge */}
                          {active && (
                            <span className="bg-accent absolute top-1.5 bottom-1.5 -left-3 w-[3px] rounded-r transition-all duration-200 ease-out" />
                          )}
                          {Icon && (
                            <Icon
                              size={17}
                              strokeWidth={1.6}
                              className={cn(
                                "shrink-0 transition-colors duration-200 ease-out",
                                active ? "text-accent" : "opacity-80",
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "whitespace-nowrap transition-opacity duration-200 ease-out",
                              expanded ? "opacity-100" : "pointer-events-none opacity-0",
                              active && "font-medium",
                            )}
                          >
                            {it.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer: pin toggle (only meaningful when expanded) */}
          <div className="border-hairline border-t p-2">
            <button
              type="button"
              onClick={togglePin}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
              className={cn(
                "text-muted hover:text-ink hover:bg-bg-soft flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-xs transition-colors",
              )}
            >
              {pinned ? (
                <ChevronsLeft size={15} strokeWidth={1.6} className="shrink-0" />
              ) : (
                <ChevronsRight size={15} strokeWidth={1.6} className="shrink-0" />
              )}
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-200 ease-out",
                  expanded ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {pinned ? "Collapse" : "Pin open"}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer — full sheet from the left */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <nav className="bg-nav-bg border-hairline absolute top-0 bottom-0 left-0 flex w-[78%] max-w-[300px] flex-col border-r">
            <div className="border-hairline flex h-14 items-center justify-between border-b px-5">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <span className="bg-accent inline-block h-2.5 w-2.5 rounded-full" />
                <span className="font-display text-[17px] font-medium tracking-tight">
                  AI Workshop
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              {sections.map(({ name, items }, i) => (
                <div key={name ?? `_${i}`} className={cn("px-3", i > 0 && "mt-4")}>
                  {name && <p className="eyebrow mb-2 px-2">{name}</p>}
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
                              "flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-all duration-200 ease-out",
                              active
                                ? "text-ink bg-bg-soft font-medium"
                                : "text-muted hover:text-ink hover:bg-bg-soft",
                            )}
                          >
                            {Icon && (
                              <Icon
                                size={17}
                                strokeWidth={1.6}
                                className={cn(active ? "text-accent" : "opacity-80")}
                              />
                            )}
                            <span>{it.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
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
