"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface ActiveBanner {
  id: string;
  kind: "timer" | "announcement";
  label: string;
  ends_at: string | null;
  created_at: string;
}

function fmtCountdown(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtRel(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `set ${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `set ${m}m ago`;
  const h = Math.floor(m / 60);
  return `set ${h}h ago`;
}

export function BannerStrip({
  cohortId,
  initialBanner = null,
}: {
  cohortId: string;
  initialBanner?: ActiveBanner | null;
}) {
  const [banner, setBanner] = useState<ActiveBanner | null>(initialBanner);
  const [, force] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Initial state already came from the server render. Subsequent fetches
    // (realtime tickle, visibility return, safety-net interval) bypass the
    // browser cache so any actual change is picked up immediately.
    async function load() {
      try {
        const r = await fetch(
          `/api/active-banner?cohortId=${encodeURIComponent(cohortId)}`,
          { cache: "reload" },
        );
        if (!r.ok) return;
        const json = (await r.json()) as { banner: ActiveBanner | null };
        if (!cancelled) setBanner(json.banner);
      } catch {
        // network blip — keep prior state
      }
    }
    function onVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisibility);
    // Safety net only — realtime broadcasts (setBanner/dismissBanner) and
    // the visibilitychange refresh drive every normal update. 5 min is enough
    // to recover if a realtime channel quietly drops.
    const fallback = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 300_000);
    const sb = getSupabaseBrowser();
    const ch = sb.channel(`cohort:${cohortId}`);
    ch.on("broadcast", { event: "banner" }, ({ payload }) => {
      // Server actions broadcast the new active banner row directly. Use the
      // payload and skip the API refetch entirely. Empty/missing payload →
      // legacy tickle: jitter the fallback fetch to avoid a thundering herd
      // when many clients receive the broadcast simultaneously.
      const p = payload as { banner?: ActiveBanner | null } | undefined;
      if (p && Object.prototype.hasOwnProperty.call(p, "banner")) {
        if (!cancelled) setBanner(p.banner ?? null);
      } else {
        setTimeout(() => load(), Math.random() * 2000);
      }
    }).subscribe();
    return () => {
      cancelled = true;
      clearInterval(fallback);
      document.removeEventListener("visibilitychange", onVisibility);
      sb.removeChannel(ch);
    };
  }, [cohortId]);

  useEffect(() => {
    if (!banner) return;
    const tick = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(tick);
  }, [banner]);

  if (!banner) return null;

  if (banner.kind === "timer") {
    if (!banner.ends_at) return null;
    const remaining = new Date(banner.ends_at).getTime() - Date.now();
    if (remaining <= 0) return null;
    return (
      <div className="bg-accent/10 border-line/60 text-ink relative z-30 w-full border-b">
        <div className="flex min-w-0 items-center gap-3 py-2 pl-12 pr-3 md:py-2.5 md:pl-[5rem] md:pr-6">
          <span className="bg-accent inline-block h-2 w-2 flex-none rounded-full" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm">{banner.label}</span>
          <span className="text-accent flex-none font-mono text-sm tabular-nums">
            {fmtCountdown(banner.ends_at)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/10 border-line/60 text-ink relative z-30 w-full border-b">
      <div className="flex min-w-0 items-center gap-3 py-2 pl-12 pr-3 md:py-2.5 md:pl-[5rem] md:pr-6">
        <span aria-hidden>📣</span>
        <span className="min-w-0 flex-1 truncate text-sm">{banner.label}</span>
        <span className="text-muted flex-none text-xs">{fmtRel(banner.created_at)}</span>
      </div>
    </div>
  );
}
