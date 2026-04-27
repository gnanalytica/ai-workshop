import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StudentRowProps {
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
  pod?: string | null;
  status?: "ok" | "at_risk" | "behind" | null;
  hint?: string;
  className?: string;
}

const STATUS: Record<NonNullable<StudentRowProps["status"]> & string, { label: string; variant: "ok" | "warn" | "danger" }> = {
  ok:      { label: "On track", variant: "ok" },
  at_risk: { label: "At risk",  variant: "warn" },
  behind:  { label: "Behind",   variant: "danger" },
};

export function StudentRow({ fullName, email, avatarUrl, pod, status, hint, className }: StudentRowProps) {
  const initial = (fullName ?? email).slice(0, 1).toUpperCase();
  const tag = status ? STATUS[status] : null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="border-line h-8 w-8 rounded-full border object-cover" />
      ) : (
        <div className="bg-bg-soft text-ink border-line flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-medium">{fullName || email}</p>
        <p className="text-muted truncate text-xs">
          {email}
          {pod && <span className="text-ink ml-2">· {pod}</span>}
          {hint && <span className="ml-2">· {hint}</span>}
        </p>
      </div>
      {tag && <Badge variant={tag.variant}>{tag.label}</Badge>}
    </div>
  );
}
