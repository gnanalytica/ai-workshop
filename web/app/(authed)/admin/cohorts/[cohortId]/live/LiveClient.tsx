"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPoll, closePoll } from "@/lib/actions/polls";
import { setBanner, dismissBanner } from "@/lib/actions/banners";

interface ActiveBanner {
  id: string;
  kind: "timer" | "announcement";
  label: string;
  ends_at: string | null;
  created_at: string;
}

interface ActivePoll {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  opened_at: string;
  closes_at: string | null;
  vote_count: number;
  chart: ReactNode;
}

const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: "1m", minutes: 1 },
  { label: "2m", minutes: 2 },
  { label: "5m", minutes: 5 },
  { label: "10m", minutes: 10 },
  { label: "Open", minutes: null },
];

function fmtRemaining(closesAt: string | null): string | null {
  if (!closesAt) return null;
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveClient({
  cohortId,
  active,
  hasActive,
  activeBanner,
}: {
  cohortId: string;
  active: ActivePoll[];
  hasActive: boolean;
  activeBanner: ActiveBanner | null;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [optionsRaw, setOptionsRaw] = useState("Yes\nNo");
  const [duration, setDuration] = useState<number | null>(1);
  const [pending, start] = useTransition();
  const [, force] = useState(0);

  const [bannerKind, setBannerKind] = useState<"timer" | "announcement">("timer");
  const [bannerLabel, setBannerLabel] = useState("");
  const [bannerMinutes, setBannerMinutes] = useState(10);

  function fireBanner() {
    const label = bannerLabel.trim();
    if (!label) {
      toast.error("Need a label");
      return;
    }
    start(async () => {
      const r = await setBanner({
        cohort_id: cohortId,
        kind: bannerKind,
        label,
        duration_minutes: bannerKind === "timer" ? bannerMinutes : undefined,
      });
      if (r.ok) {
        toast.success("Banner set");
        setBannerLabel("");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function fireDismiss(bannerId: string) {
    start(async () => {
      const r = await dismissBanner({ cohort_id: cohortId, banner_id: bannerId });
      if (r.ok) {
        toast.success("Banner dismissed");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  const hasBannerTimer = activeBanner?.kind === "timer" && !!activeBanner.ends_at;
  useEffect(() => {
    if (!hasActive && !hasBannerTimer) return;
    const tick = setInterval(() => force((n) => n + 1), 1000);
    const refresh = setInterval(() => router.refresh(), 5000);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [hasActive, hasBannerTimer, router]);

  function firePulse() {
    start(async () => {
      const r = await createPoll({
        cohort_id: cohortId,
        question: "Quick pulse",
        options: ["👍 Got it", "🤔 Fuzzy", "😅 Lost me"],
        duration_minutes: 1,
        kind: "pulse",
      });
      if (r.ok) {
        toast.success("Pulse sent");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function fire() {
    const options = optionsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!question || options.length < 2) {
      toast.error("Need a question and ≥ 2 options");
      return;
    }
    start(async () => {
      const r = await createPoll({
        cohort_id: cohortId,
        question,
        options,
        duration_minutes: duration ?? undefined,
      });
      if (r.ok) {
        toast.success("Poll fired");
        setQuestion("");
        setOptionsRaw("Yes\nNo");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function endNow(pollId: string) {
    start(async () => {
      const r = await closePoll({ poll_id: pollId, cohort_id: cohortId });
      if (r.ok) {
        toast.success("Closed");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <Card
        className={
          (hasActive ? "p-5" : "mx-auto max-w-xl p-6") +
          " border-warn/40"
        }
      >
        <div className="flex items-center gap-2">
          <CardTitle>Quick pulse</CardTitle>
          <Badge variant="warn">Pulse</Badge>
        </div>
        <CardSub className="mt-1">
          3 emoji buttons go to the room: 👍 got it · 🤔 fuzzy · 😅 lost me
        </CardSub>
        <div className="mt-4">
          <Button onClick={firePulse} disabled={pending}>
            {pending ? "Sending…" : "Send pulse"}
          </Button>
        </div>
      </Card>

      <Card className={hasActive ? "p-5" : "mx-auto max-w-xl p-6"}>
        <CardTitle>Banner</CardTitle>
        <CardSub className="mt-1">
          Sticky strip at the top of the cohort. One at a time.
        </CardSub>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bannerKind}
              onChange={(e) => setBannerKind(e.target.value as "timer" | "announcement")}
              className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
            >
              <option value="timer">Timer</option>
              <option value="announcement">Announcement</option>
            </select>
            {bannerKind === "timer" && (
              <Input
                type="number"
                min={1}
                max={240}
                value={bannerMinutes}
                onChange={(e) => setBannerMinutes(Number(e.target.value) || 1)}
                className="w-24"
              />
            )}
          </div>
          <Input
            placeholder={
              bannerKind === "timer" ? "10-min exercise" : "We restart at 2:00"
            }
            value={bannerLabel}
            onChange={(e) => setBannerLabel(e.target.value)}
            maxLength={120}
          />
          <div className="flex justify-end">
            <Button onClick={fireBanner} disabled={pending}>
              {pending ? "Setting…" : "Set banner"}
            </Button>
          </div>
          {activeBanner && (
            <div className="border-line bg-bg-elev mt-3 flex flex-wrap items-center gap-2 rounded-md border p-3">
              <Badge variant="accent">
                {activeBanner.kind === "timer" ? "Timer" : "Announcement"}
              </Badge>
              <span className="text-ink min-w-0 flex-1 truncate text-sm">
                {activeBanner.label}
              </span>
              {activeBanner.kind === "timer" && activeBanner.ends_at && (
                <span className="text-muted font-mono text-xs tabular-nums">
                  {fmtRemaining(activeBanner.ends_at)}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fireDismiss(activeBanner.id)}
                disabled={pending}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className={hasActive ? "p-5" : "mx-auto max-w-xl p-6"}>
        <CardTitle>Fire a poll</CardTitle>
        <CardSub className="mt-1">
          One question. The room sees it within 15 seconds.
        </CardSub>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            rows={4}
            placeholder="One option per line"
            value={optionsRaw}
            onChange={(e) => setOptionsRaw(e.target.value)}
            className="border-line bg-input-bg text-ink w-full rounded-md border p-3 font-mono text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => setDuration(d.minutes)}
                className={
                  "rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors " +
                  (duration === d.minutes
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-muted hover:border-accent/40 hover:text-ink")
                }
              >
                {d.label}
              </button>
            ))}
            <div className="flex-1" />
            <Button onClick={fire} disabled={pending}>
              {pending ? "Firing…" : "Fire poll"}
            </Button>
          </div>
        </div>
      </Card>

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((p) => {
            const remaining = fmtRemaining(p.closes_at);
            return (
              <Card key={p.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="min-w-0 break-words">{p.question}</CardTitle>
                  <div className="flex items-center gap-2">
                    {remaining && (
                      <Badge variant="accent">
                        <span className="font-mono tabular-nums">{remaining}</span>
                      </Badge>
                    )}
                    <Badge>{p.vote_count} votes</Badge>
                    <Button size="sm" variant="outline" onClick={() => endNow(p.id)} disabled={pending}>
                      End now
                    </Button>
                  </div>
                </div>
                {p.chart}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
