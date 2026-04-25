import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/format";

export interface DayCardProps {
  dayNumber: number;
  title: string;
  isUnlocked: boolean;
  liveSessionAt?: string | null;
  capstoneKind?: "spec_review" | "mid_review" | "demo_day" | "none" | null;
  href?: string;
  className?: string;
}

const CAPSTONE: Record<string, string> = {
  spec_review: "Spec review",
  mid_review:  "Mid review",
  demo_day:    "Demo day",
};

export function DayCard({
  dayNumber,
  title,
  isUnlocked,
  liveSessionAt,
  capstoneKind,
  href,
  className,
}: DayCardProps) {
  const cap = capstoneKind && capstoneKind !== "none" ? CAPSTONE[capstoneKind] : null;
  const inner = (
    <div
      className={cn(
        "border-line bg-card hover:border-accent/40 rounded-lg border p-4 transition-colors",
        !isUnlocked && "opacity-60",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted font-mono text-xs">Day {dayNumber}</span>
        <div className="flex gap-1">
          {cap && <Badge variant="accent">{cap}</Badge>}
          {!isUnlocked && <Badge>Locked</Badge>}
        </div>
      </div>
      <h3 className="mt-2 text-base font-medium tracking-tight">{title}</h3>
      {liveSessionAt && (
        <p className="text-muted mt-2 text-xs">Live · {fmtDateTime(liveSessionAt)}</p>
      )}
    </div>
  );
  return href && isUnlocked ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
