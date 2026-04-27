import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DayRailItem {
  day: number;
  title: string;
  unlocked: boolean;
  done?: boolean;
}

export function DayRail({
  items,
  activeDay,
  basePath = "/day",
}: {
  items: readonly DayRailItem[];
  activeDay: number;
  basePath?: string;
}) {
  return (
    <aside className="bg-nav-bg border-line h-full w-56 shrink-0 overflow-y-auto border-r p-3 text-sm">
      <p className="text-muted mb-2 px-2 text-xs font-medium tracking-widest uppercase">
        Curriculum
      </p>
      <ol className="space-y-0.5">
        {items.map((it) => {
          const active = it.day === activeDay;
          const cls = cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-all duration-200 ease-out",
            active
              ? "bg-bg-soft text-ink font-medium"
              : it.unlocked
                ? "text-muted hover:bg-bg-soft hover:text-ink"
                : "text-muted/50 cursor-not-allowed",
          );
          const inner = (
            <>
              <span className="font-mono text-[10px] tabular-nums">D{String(it.day).padStart(2, "0")}</span>
              <span className="truncate">{it.title}</span>
              {it.done && <span className="text-accent ml-auto text-xs">✓</span>}
            </>
          );
          return (
            <li key={it.day}>
              {it.unlocked ? (
                <Link
                  href={`${basePath}/${it.day}`}
                  className={cn(
                    cls,
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
                  )}
                >
                  {inner}
                </Link>
              ) : (
                <div className={cls} aria-disabled>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
