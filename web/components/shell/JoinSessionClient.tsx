"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, Pencil, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setCohortDayMeetLink } from "@/lib/actions/schedule";

export function JoinSessionClient({
  cohortId,
  dayNumber,
  meetLink,
  canEdit,
}: {
  cohortId: string;
  dayNumber: number;
  meetLink: string | null;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(meetLink ?? "");
  const [pending, start] = useTransition();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setValue(meetLink ?? "");
  }, [meetLink]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function save(next: string) {
    const clean = next.trim();
    start(async () => {
      const r = await setCohortDayMeetLink({
        cohort_id: cohortId,
        day_number: dayNumber,
        meet_link: clean === "" ? null : clean,
      });
      if (r.ok) {
        toast.success(clean === "" ? "Meet link cleared" : "Meet link updated");
        setOpen(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={popoverRef}>
      {meetLink ? (
        <a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "bg-accent text-cta-ink hover:opacity-90 inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-opacity",
          )}
          aria-label="Join live session"
          title="Join live session"
        >
          <Video size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Join live</span>
          <ExternalLink size={11} className="hidden sm:inline opacity-80" />
        </a>
      ) : canEdit ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-label="Add live session link"
          title="Add live session link"
        >
          <Video size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Add link</span>
        </Button>
      ) : null}

      {canEdit && meetLink && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen((o) => !o)}
          aria-label="Update live session link"
          title="Update live session link"
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Button>
      )}

      {open && canEdit && (
        <div
          role="dialog"
          aria-label="Update live session link"
          className="border-line bg-card absolute right-0 top-full z-40 mt-2 w-[320px] rounded-md border p-3 shadow-lift"
        >
          <p className="text-muted mb-2 text-[11px] uppercase tracking-widest">
            Day {dayNumber} · Live session link
          </p>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://meet.google.com/…"
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save(value);
              }
            }}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => save("")}
              disabled={pending || (!meetLink && value.trim() === "")}
              className="text-muted hover:text-danger text-xs underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear link
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue(meetLink ?? "");
                  setOpen(false);
                }}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => save(value)} disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
