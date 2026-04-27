import Link from "next/link";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  tone?: "default" | "accent" | "warn" | "ok" | "danger";
  href?: string;
  className?: string;
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-ink",
  accent: "text-accent",
  warn: "text-warn",
  ok: "text-ok",
  danger: "text-danger",
};

export function StatCard({ label, value, delta, hint, tone = "default", href, className }: StatCardProps) {
  const body = (
    <>
      <p className="text-muted text-xs font-medium tracking-widest uppercase">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight", TONE_STYLES[tone])}>
        {value}
      </p>
      {(delta || hint) && (
        <p className="text-muted mt-1.5 flex items-center gap-2 text-xs">
          {delta && <span className="text-ink">{delta}</span>}
          {hint && <span>{hint}</span>}
        </p>
      )}
    </>
  );
  const base = "border-line bg-card rounded-lg border p-5";
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "hover:border-accent/40 hover:bg-bg-soft block transition-colors",
          className,
        )}
      >
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
  );
}
