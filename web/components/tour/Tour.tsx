"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { markOnboarded } from "@/lib/actions/profile";
import type { TourStep } from "@/lib/tours";

export function Tour({ steps }: { steps: TourStep[] }) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  useLayoutEffect(() => {
    if (!open || !step) return;
    if (!step.selector) {
      setAnchor(null);
      return;
    }
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setAnchor(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const update = () => setAnchor(el.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  if (!open || !step) return null;

  function next() {
    if (isLast) finish();
    else setIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function back() {
    setIndex((i) => Math.max(i - 1, 0));
  }
  async function finish() {
    setOpen(false);
    await markOnboarded();
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
        onClick={finish}
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
          </span>
          <button
            type="button"
            onClick={finish}
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
            className="bg-accent text-cta-ink rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
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
