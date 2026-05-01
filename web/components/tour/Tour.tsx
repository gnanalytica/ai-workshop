"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { markOnboarded } from "@/lib/actions/profile";
import { tourFor, type TourStep } from "@/lib/tours";
import type { Persona } from "@/lib/auth/persona";

export const TOUR_EVENT = "tour:start";
const DISMISS_KEY = "tour.dismissed";

/**
 * Mount-once tour controller. Auto-runs the first time per user (when the
 * server says `onboarded_at` is null AND we haven't dismissed it locally
 * already). Can be re-launched anywhere by dispatching:
 *
 *   window.dispatchEvent(new CustomEvent("tour:start", { detail: { persona: "admin" } }))
 *
 * The localStorage `tour.dismissed=1` guard prevents the tour from
 * re-opening on the next navigation/refresh while the markOnboarded
 * server action is still in flight (its revalidatePath race-window was
 * causing the tour to reopen unexpectedly).
 */
export function TourMount({
  persona,
  initialOpen,
}: {
  persona: Persona | null;
  initialOpen: boolean;
}) {
  // Seed lazily so we can read localStorage on the client only.
  // Students never auto-open — they get the Day 0 banner + /onboarding tour
  // instead, which is a less interruptive flow. Faculty/admin still see the
  // first-time auto-launch (it points them at handbook/admin pages they need
  // to know exist). Manual replay via StartGuideButton works for everyone.
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (persona === "student") return false;
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return false;
    } catch {
      // ignore
    }
    return initialOpen;
  });
  const [activePersona, setActivePersona] = useState<Persona | null>(persona);

  useEffect(() => {
    function onStart(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { persona?: Persona | null }
        | undefined;
      setActivePersona(detail?.persona ?? persona);
      setOpen(true);
    }
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [persona]);

  if (!open) return null;
  const steps = tourFor(activePersona);
  if (steps.length === 0) return null;
  return (
    <Tour
      steps={steps}
      onClose={(_completed) => {
        setOpen(false);
        try {
          window.localStorage.setItem(DISMISS_KEY, "1");
        } catch {
          // ignore
        }
        // Persist server-side too so a future device / browser doesn't
        // re-trigger. markOnboarded is idempotent (filters onboarded_at IS NULL).
        if (initialOpen) void markOnboarded();
      }}
    />
  );
}

function Tour({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: (completed: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [index, setIndex] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [navigating, setNavigating] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Track the index we last triggered navigation for so server-side redirects
  // (e.g. /admin/roster → /admin/cohorts/<id>/roster) don't cause infinite
  // re-pushes when pathname stabilizes on a different URL than step.path.
  const navigatedForIndexRef = useRef<number>(-1);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  // Resolve the anchor for the current step. Three flavors:
  //   1. step has a `path` we're not on yet → router.push(); show "loading"
  //      state. The pathname dep retriggers when navigation completes.
  //   2. step has a selector → poll for it (handles async-rendered DOM after
  //      route change) and re-position on resize / scroll.
  //   3. step has neither → centered card.
  useLayoutEffect(() => {
    if (!step) return;

    // (1) Navigate first if needed. Only push once per step — once we've
    // started a push for this step we wait for the pathname/DOM to settle and
    // don't retry. This handles server redirects (e.g. /admin/roster →
    // /admin/cohorts/<id>/roster) which would otherwise loop.
    if (step.path && pathname !== step.path) {
      if (navigatedForIndexRef.current !== index) {
        navigatedForIndexRef.current = index;
        setAnchor(null);
        setNavigating(true);
        router.push(step.path);
        return;
      }
      // Already pushed for this step — pathname differs because of redirect.
      // Carry on and search for the selector on whatever page we landed on.
    }

    setNavigating(false);

    if (!step.selector) {
      setAnchor(null);
      return;
    }

    // (2) Poll for the anchor element. Useful right after a route change when
    // the destination page may stream in. Bail after 4s and center the card.
    let raf = 0;
    let canceled = false;
    const startedAt = performance.now();
    const update = (el: HTMLElement) => {
      if (!canceled) setAnchor(el.getBoundingClientRect());
    };
    const onResize = () => {
      const el = step.selector
        ? (document.querySelector(step.selector) as HTMLElement | null)
        : null;
      if (el) update(el);
    };
    const tick = () => {
      if (canceled) return;
      const el = document.querySelector(step.selector!) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        update(el);
        return;
      }
      if (performance.now() - startedAt > 4000) {
        setAnchor(null); // give up; card centers
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [step, pathname, router, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!step) return null;

  function next() {
    if (isLast) finish();
    else setIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function back() {
    setIndex((i) => Math.max(i - 1, 0));
  }
  function finish() {
    onClose(true);
  }
  function skip() {
    onClose(false);
  }

  // Position the card next to the anchor; otherwise center it.
  const card = anchor ? anchorPosition(anchor) : centeredPosition();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      className="fixed inset-0 z-[100]"
    >
      {/* Backdrop with a cutout around the anchor for a spotlight effect. */}
      <div
        className="pointer-events-auto absolute inset-0 bg-black/55 backdrop-blur-[1px] transition-opacity"
        onClick={skip}
      />
      {anchor && (
        <div
          aria-hidden
          className="border-accent/70 ring-accent/20 pointer-events-none absolute rounded-md border-2 ring-4 transition-[top,left,width,height] duration-150"
          style={{
            top: anchor.top - 4,
            left: anchor.left - 4,
            width: anchor.width + 8,
            height: anchor.height + 8,
          }}
        />
      )}

      <div
        ref={cardRef}
        className="border-line bg-bg text-ink pointer-events-auto absolute w-[min(360px,calc(100vw-32px))] rounded-lg border p-5 shadow-2xl"
        style={card}
      >
        <div className="text-muted mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span>
            Step {index + 1} of {steps.length}
            {step.path && (
              <span className="text-accent/80 ml-2 font-mono normal-case tracking-normal">
                {step.path}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={skip}
            className="hover:text-ink transition-colors"
            aria-label="Skip tour"
          >
            Skip
          </button>
        </div>
        <h2 id="tour-title" className="text-lg font-semibold tracking-tight">
          {step.title}
        </h2>
        <p className="text-muted mt-1.5 text-sm leading-relaxed">{step.body}</p>
        {navigating && (
          <p className="text-accent mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
            Loading {step.path}…
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={back}
            disabled={isFirst}
            className="text-muted hover:text-ink rounded-md px-2 py-1 text-sm transition-colors disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={navigating}
            className="bg-accent text-cta-ink rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLast ? "Done" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function anchorPosition(rect: DOMRect): React.CSSProperties {
  const margin = 12;
  const cardW = 360;
  const cardH = 200;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // Prefer right side; fall back to below or above if no horizontal room.
  let left = rect.right + margin;
  let top = rect.top;
  if (left + cardW > vw - margin) {
    // Try below.
    left = Math.min(Math.max(rect.left, margin), vw - cardW - margin);
    top = rect.bottom + margin;
    if (top + cardH > vh - margin) {
      // Above as last resort.
      top = Math.max(rect.top - cardH - margin, margin);
    }
  }
  // Clamp into viewport.
  top = Math.min(Math.max(top, margin), vh - cardH - margin);
  return { top, left };
}

function centeredPosition(): React.CSSProperties {
  return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
}
