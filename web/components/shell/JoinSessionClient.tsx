"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, Pencil, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setCohortMeetLink } from "@/lib/actions/schedule";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function JoinSessionClient({
  cohortId,
  cohortName,
  meetLink,
  canEdit,
}: {
  cohortId: string;
  cohortName: string | null;
  meetLink: string | null;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [liveLink, setLiveLink] = useState<string | null>(meetLink);
  const [value, setValue] = useState(meetLink ?? "");
  const [pending, start] = useTransition();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // The label every persona sees on the affordance. The live link is now
  // cohort-wide (one recurring room across all 30 days) so the cohort name
  // is the only piece of context we need in copy.
  const cohortLabel = cohortName?.trim() || "this cohort";
  const titleAttr = liveLink
    ? `Join live · ${cohortLabel}`
    : `Add live link · ${cohortLabel}`;

  useEffect(() => {
    setLiveLink(meetLink);
    setValue(meetLink ?? "");
  }, [meetLink]);

  // Subscribe to the cohort's realtime topic so the Join button flips for
  // students/faculty the moment admin or faculty save a link — mirrors the
  // poll/banner broadcast pattern. Payload carries the new link inline.
  useEffect(() => {
    const sb = getSupabaseBrowser();
    const ch = sb.channel(`cohort:${cohortId}`);
    ch.on("broadcast", { event: "meet" }, ({ payload }) => {
      const p = payload as { meet_link?: string | null } | undefined;
      if (!p) return;
      const next = p.meet_link ?? null;
      setLiveLink(next);
      setValue(next ?? "");
    }).subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [cohortId]);

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
      const r = await setCohortMeetLink({
        cohort_id: cohortId,
        meet_link: clean === "" ? null : clean,
      });
      if (r.ok) {
        // Optimistically reflect the change locally; the broadcast tickle
        // will arrive shortly and confirm (or correct) for everyone else.
        setLiveLink(clean === "" ? null : clean);
        toast.success(
          clean === ""
            ? `Cleared link · ${cohortLabel}`
            : `Updated link · ${cohortLabel}`,
        );
        setOpen(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={popoverRef}>
      {liveLink ? (
        <a
          href={liveLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "bg-accent text-cta-ink hover:opacity-90 inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-opacity",
          )}
          aria-label={titleAttr}
          title={titleAttr}
        >
          <Video size={14} strokeWidth={2} />
          <span className="hidden whitespace-nowrap sm:inline">Join live</span>
          <ExternalLink size={11} className="hidden sm:inline opacity-80" />
        </a>
      ) : canEdit ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-label={titleAttr}
          title={titleAttr}
        >
          <Video size={14} strokeWidth={2} />
          <span className="hidden whitespace-nowrap sm:inline">Add link</span>
        </Button>
      ) : null}

      {canEdit && liveLink && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Update live link for ${cohortLabel}`}
          title={`Update live link · ${cohortLabel}`}
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Button>
      )}

      {open && canEdit && (
        <div
          role="dialog"
          aria-label={`Update live link for ${cohortLabel}`}
          className="border-line bg-card absolute right-0 top-full z-40 mt-2 w-[320px] rounded-md border p-3 shadow-lift"
        >
          <p className="text-muted mb-2 text-[11px] uppercase tracking-widest">
            Live link · {cohortLabel}
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
              disabled={pending || (!liveLink && value.trim() === "")}
              className="text-muted hover:text-danger text-xs underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear link
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue(liveLink ?? "");
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
