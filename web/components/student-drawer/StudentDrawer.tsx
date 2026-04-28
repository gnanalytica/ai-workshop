"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSub, CardTitle } from "@/components/ui/card";
import { fetchStudentDrawer } from "@/lib/actions/student-drawer";
import type { StudentDrawerSummary } from "@/lib/queries/faculty-student";
import { fmtDate, relTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface StudentDrawerTarget {
  user_id: string;
  full_name: string | null;
}

export function StudentDrawer({
  cohortId,
  target,
  onClose,
}: {
  cohortId: string;
  target: StudentDrawerTarget | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<StudentDrawerSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const open = target !== null;

  useEffect(() => {
    if (!target) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStudentDrawer(target.user_id, cohortId)
      .then((r) => {
        if (cancelled) return;
        if (r.ok) setData(r.data ?? null);
        else setError(r.error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target, cohortId]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student detail"
      className="fixed inset-0 z-50"
    >
      <div
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside
        className={cn(
          "bg-card border-line absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l shadow-xl",
          "duration-200 motion-safe:animate-in motion-safe:slide-in-from-right",
        )}
      >
        <div className="border-line bg-card sticky top-0 flex items-center justify-between gap-2 border-b px-5 py-3">
          <div className="min-w-0">
            <CardTitle className="truncate">
              {data?.full_name ?? target?.full_name ?? "Student"}
            </CardTitle>
            {data?.email && (
              <p className="text-muted truncate text-xs">{data.email}</p>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={close} aria-label="Close">
            Close
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {loading && <CardSub>Loading…</CardSub>}
          {error && (
            <CardSub className="text-danger">Could not load: {error}</CardSub>
          )}
          {data && (
            <>
              <Section title="Pod">
                {data.pod_name ? (
                  <Badge variant="accent">{data.pod_name}</Badge>
                ) : (
                  <CardSub className="text-xs">Not in a pod yet.</CardSub>
                )}
              </Section>

              <Section title="Today's lab">
                {data.labsToday ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>Day {data.labsToday.day_number}</Badge>
                    <span className="text-muted">
                      {data.labsToday.status ?? "not started"}
                    </span>
                  </div>
                ) : (
                  <CardSub className="text-xs">No lab activity yet.</CardSub>
                )}
                <CardSub className="mt-1 text-xs">
                  {data.labsDone} lab{data.labsDone === 1 ? "" : "s"} completed
                </CardSub>
              </Section>

              <Section title="Attendance">
                <CardSub className="text-xs">
                  {data.attendance.present}/{data.attendance.total} sessions
                </CardSub>
              </Section>

              <Section title="Recent submissions">
                {data.recentSubmissions.length === 0 ? (
                  <CardSub className="text-xs">No submissions yet.</CardSub>
                ) : (
                  <ul className="divide-line/50 divide-y text-sm">
                    {data.recentSubmissions.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-ink truncate font-medium">
                            {s.assignment_title}
                          </p>
                          <p className="text-muted text-xs">
                            Day {s.day_number} · {fmtDate(s.updated_at)} ·{" "}
                            {relTime(s.updated_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            s.status === "graded"
                              ? "ok"
                              : s.status === "submitted"
                                ? "warn"
                                : "default"
                          }
                        >
                          {s.status}
                          {s.score != null ? ` · ${s.score}` : ""}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {data.mentorNote && (
                <Section title="Faculty note">
                  <CardSub className="text-sm whitespace-pre-wrap">
                    {data.mentorNote}
                  </CardSub>
                </Section>
              )}

              <div className="border-line border-t pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/faculty/student/${data.user_id}`}>
                    Open full profile →
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-muted mb-1.5 text-[11px] font-medium uppercase tracking-wider">
        {title}
      </p>
      {children}
    </section>
  );
}
