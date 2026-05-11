"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Megaphone, Sparkles, Vote } from "lucide-react";
import { createPoll, closePoll, launchPoll } from "@/lib/actions/polls";
import { setBanner, dismissBanner } from "@/lib/actions/banners";
import { getSupabaseBrowser } from "@/lib/supabase/client";

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

interface DraftPollSummary {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  kind: "poll" | "pulse";
  day_number: number | null;
}

const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: "1m", minutes: 1 },
  { label: "2m", minutes: 2 },
  { label: "5m", minutes: 5 },
  { label: "10m", minutes: 10 },
  { label: "Open", minutes: null },
];

type LauncherTab = "pulse" | "poll" | "banner" | "drafts";

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
  drafts,
}: {
  cohortId: string;
  active: ActivePoll[];
  hasActive: boolean;
  activeBanner: ActiveBanner | null;
  drafts: DraftPollSummary[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [, force] = useState(0);
  const [tab, setTab] = useState<LauncherTab>(
    drafts.length > 0 ? "drafts" : "pulse",
  );

  // Poll form state
  const [question, setQuestion] = useState("");
  const [optionsRaw, setOptionsRaw] = useState("Yes\nNo");
  const [duration, setDuration] = useState<number | null>(1);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  // Banner form state
  const [bannerKind, setBannerKind] = useState<"timer" | "announcement">("timer");
  const [bannerLabel, setBannerLabel] = useState("");
  const [bannerMinutes, setBannerMinutes] = useState(10);

  const hasBannerTimer = activeBanner?.kind === "timer" && !!activeBanner.ends_at;

  useEffect(() => {
    if (!hasActive && !hasBannerTimer) return;
    const tick = setInterval(() => force((n) => n + 1), 1000);
    const sb = getSupabaseBrowser();
    const ch = sb
      .channel(`cohort:${cohortId}`)
      .on("broadcast", { event: "poll" }, () => router.refresh())
      .on("broadcast", { event: "banner" }, () => router.refresh())
      .subscribe();
    return () => {
      clearInterval(tick);
      sb.removeChannel(ch);
    };
  }, [hasActive, hasBannerTimer, router, cohortId]);

  function firePulse() {
    start(async () => {
      const r = await createPoll({
        cohort_id: cohortId,
        question: "How are you following along?",
        options: ["✅ I understand", "🤔 Some parts unclear", "🙋 I need help"],
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
        as_draft: saveAsDraft,
      });
      if (r.ok) {
        toast.success(saveAsDraft ? "Draft saved" : "Poll fired");
        setQuestion("");
        setOptionsRaw("Yes\nNo");
        setSaveAsDraft(false); // reset so the next "Fire poll" doesn't silently save again
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function launch(pollId: string, durationMin: number | null) {
    start(async () => {
      const r = await launchPoll({
        poll_id: pollId,
        cohort_id: cohortId,
        duration_minutes: durationMin ?? undefined,
      });
      if (r.ok) {
        toast.success("Poll launched");
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

  return (
    <div className="space-y-4">
      {/* ─────────────── LIVE NOW ─────────────── */}
      <section className="space-y-3">
        <header className="border-line/50 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
          <h2 className="text-lg font-semibold tracking-tight">Live now</h2>
          <p className="text-muted text-xs">
            {hasActive
              ? `${active.length} poll${active.length === 1 ? "" : "s"} running`
              : "nothing live — use the launcher below"}
          </p>
        </header>

        {!hasActive && !activeBanner && (
          <Card className="border-line/60 border-dashed">
            <CardSub>
              Nothing live right now. Fire a quick pulse, custom poll, or set a
              banner from the launcher below.
            </CardSub>
          </Card>
        )}

        {activeBanner && (
          <Card className="border-accent/30 flex flex-wrap items-center gap-2 p-3">
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
          </Card>
        )}

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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => endNow(p.id)}
                    disabled={pending}
                  >
                    End now
                  </Button>
                </div>
              </div>
              {p.chart}
            </Card>
          );
        })}
      </section>

      {/* ─────────────── LAUNCHER ─────────────── */}
      <section className="space-y-3">
        <header className="border-line/50 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
          <h2 className="text-lg font-semibold tracking-tight">Launch</h2>
          <p className="text-muted text-xs">
            Pulse for a temperature check · Poll for a real question · Banner
            for a sticky notice · Drafts you saved earlier
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-1.5">
          <LauncherTab
            id="pulse"
            current={tab}
            setCurrent={setTab}
            icon={<Sparkles size={14} />}
            label="Quick pulse"
          />
          <LauncherTab
            id="poll"
            current={tab}
            setCurrent={setTab}
            icon={<Vote size={14} />}
            label="Custom poll"
          />
          <LauncherTab
            id="banner"
            current={tab}
            setCurrent={setTab}
            icon={<Megaphone size={14} />}
            label="Banner"
          />
          <LauncherTab
            id="drafts"
            current={tab}
            setCurrent={setTab}
            icon={<Activity size={14} />}
            label={`Drafts${drafts.length > 0 ? ` · ${drafts.length}` : ""}`}
          />
        </div>

        {tab === "pulse" && (
          <Card className="space-y-3 p-5">
            <CardSub>
              Sends 3 buttons to the room: ✅ I understand · 🤔 Some parts
              unclear · 🙋 I need help. Closes in 1 minute.
            </CardSub>
            <Button onClick={firePulse} disabled={pending}>
              {pending ? "Sending…" : "Send pulse"}
            </Button>
          </Card>
        )}

        {tab === "poll" && (
          <Card className="space-y-3 p-5">
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
              <label className="text-muted ml-2 inline-flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={saveAsDraft}
                  onChange={(e) => setSaveAsDraft(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Save as draft
              </label>
              <div className="flex-1" />
              <Button onClick={fire} disabled={pending}>
                {pending
                  ? saveAsDraft
                    ? "Saving…"
                    : "Firing…"
                  : saveAsDraft
                    ? "Save draft"
                    : "Fire poll"}
              </Button>
            </div>
          </Card>
        )}

        {tab === "banner" && (
          <Card className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bannerKind}
                onChange={(e) =>
                  setBannerKind(e.target.value as "timer" | "announcement")
                }
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
                  onChange={(e) =>
                    setBannerMinutes(Number(e.target.value) || 1)
                  }
                  className="w-24"
                />
              )}
            </div>
            <Input
              placeholder={
                bannerKind === "timer"
                  ? "10-min exercise"
                  : "We restart at 2:00"
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
          </Card>
        )}

        {tab === "drafts" && (
          <Card className="space-y-3 p-5">
            {drafts.length === 0 ? (
              <CardSub>
                No drafts saved yet. To create one: switch to the{" "}
                <button
                  type="button"
                  onClick={() => setTab("poll")}
                  className="text-accent hover:underline"
                >
                  Custom poll
                </button>{" "}
                tab, write your question, tick{" "}
                <span className="text-ink font-medium">Save as draft</span>{" "}
                instead of firing — and it&apos;ll land here, ready to
                launch in one click.
              </CardSub>
            ) : (
              <div className="space-y-2">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="border-line bg-bg-elev flex flex-wrap items-center gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {d.kind === "pulse" && (
                          <Badge variant="warn">Pulse</Badge>
                        )}
                        {d.day_number != null && (
                          <span className="text-muted font-mono text-[10px] uppercase tracking-wider">
                            Day {d.day_number}
                          </span>
                        )}
                      </div>
                      <p className="text-ink mt-1 truncate text-sm">
                        {d.question}
                      </p>
                      <p className="text-muted truncate text-xs">
                        {d.options.map((o) => o.label).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => launch(d.id, 1)}
                        disabled={pending}
                      >
                        Launch · 1m
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => launch(d.id, 5)}
                        disabled={pending}
                      >
                        5m
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => launch(d.id, null)}
                        disabled={pending}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}

function LauncherTab({
  id,
  current,
  setCurrent,
  icon,
  label,
}: {
  id: LauncherTab;
  current: LauncherTab;
  setCurrent: (t: LauncherTab) => void;
  icon: ReactNode;
  label: string;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => setCurrent(id)}
      className={
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line text-muted hover:text-ink hover:border-accent/40")
      }
    >
      {icon}
      {label}
    </button>
  );
}
