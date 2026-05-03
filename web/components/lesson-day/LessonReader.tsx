"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Chunked reader" wrapper for a markdown phase. Replaces the long-form
 * scroll with one-section-at-a-time presentation: title + content + clear
 * Prev / Next controls and a dot progress strip. Keyboard arrows + Home/End
 * navigate. Smoothly scrolls the reader into view on section change.
 *
 * Pass titles + a matching set of children (the rendered <MarkdownView>
 * for each section, computed server-side and passed through):
 *
 *   <LessonReader titles={titles}>
 *     <MarkdownView source={s1} />
 *     <MarkdownView source={s2} />
 *     …
 *   </LessonReader>
 *
 * If only one child is passed (or no titled sections), the chrome collapses
 * and the child is rendered as-is.
 */
export function LessonReader({
  titles,
  children,
  /** Optional extra content to render after the last section (poll, tools, etc). */
  trailing,
  /** Optional inline content keyed by section index — renders right under that section's body. */
  sectionAddons,
}: {
  titles: (string | null)[];
  children: ReactNode;
  trailing?: ReactNode;
  sectionAddons?: Record<number, ReactNode>;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;

  const [idx, setIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const goto = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIdx(clamped);
    },
    [total],
  );

  useEffect(() => {
    if (total <= 1) return;
    function onKey(e: KeyboardEvent) {
      // Don't hijack typing in form fields.
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (t?.isContentEditable) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goto(idx + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goto(idx - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goto(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goto(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, total, goto]);

  // Smoothly scroll the reader into view when the section changes (skip first mount).
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx]);

  if (total === 0) return null;

  // Single section → just render it without chrome (preserves the existing
  // feel for short phases like "extra references").
  if (total === 1) {
    return (
      <div ref={rootRef}>
        {items[0]}
        {sectionAddons?.[0] && <div className="mt-6">{sectionAddons[0]}</div>}
        {trailing}
      </div>
    );
  }

  const isFirst = idx === 0;
  const isLast = idx === total - 1;
  const title = titles[idx] ?? null;

  return (
    <div ref={rootRef} className="space-y-6 scroll-mt-20">
      {/* Section header */}
      <div className="border-line bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
        <div className="min-w-0">
          <p className="text-muted text-[10.5px] font-semibold uppercase tracking-[0.18em]">
            Section {idx + 1} of {total}
          </p>
          {title && (
            <p className="text-ink mt-0.5 text-[14px] font-semibold tracking-tight">
              {title}
            </p>
          )}
        </div>
        <DotStrip total={total} idx={idx} onPick={goto} />
      </div>

      {/* Section content — only the active child is rendered */}
      <div>{items[idx]}</div>

      {/* Inline addon for this specific section (e.g., AssignmentBlock under the
          "Assignment" H2). Renders directly below the section body so the
          submit form is on the same page as the narrative. */}
      {sectionAddons?.[idx] && <div className="mt-6">{sectionAddons[idx]}</div>}

      {/* Trailing widgets only on the last section */}
      {isLast && trailing}

      {/* Footer nav */}
      <div className="border-line flex items-center justify-between gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => goto(idx - 1)}
          disabled={isFirst}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
            isFirst
              ? "text-muted/50 cursor-not-allowed"
              : "text-ink hover:bg-bg-soft",
          )}
        >
          <ArrowLeft size={14} strokeWidth={2.1} />
          Previous
        </button>
        <span className="text-muted/70 hidden text-[10.5px] uppercase tracking-[0.18em] md:inline">
          ← / → keys
        </span>
        <button
          type="button"
          onClick={() => goto(idx + 1)}
          disabled={isLast}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-opacity",
            isLast
              ? "bg-ok/15 text-ok cursor-default"
              : "bg-accent text-cta-ink hover:opacity-90",
          )}
        >
          {isLast ? "Section complete" : "Next"}
          {!isLast && <ArrowRight size={14} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
}

function DotStrip({
  total,
  idx,
  onPick,
}: {
  total: number;
  idx: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Section progress">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Section ${i + 1}`}
            onClick={() => onPick(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              active
                ? "bg-accent w-6"
                : done
                  ? "bg-accent/45 w-3"
                  : "bg-line w-3 hover:bg-muted/50",
            )}
          />
        );
      })}
    </div>
  );
}
