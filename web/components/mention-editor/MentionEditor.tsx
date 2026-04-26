"use client";

import { useEffect, useRef, useState } from "react";
import type { RosterMember } from "@/lib/queries/cohort-roster-mini";

interface MentionEditorProps {
  value: string;
  onChange: (next: string) => void;
  roster: RosterMember[];
  rows?: number;
  placeholder?: string;
  className?: string;
}

interface PopupState {
  open: boolean;
  query: string;
  start: number;
  end: number;
  index: number;
}

const initial: PopupState = { open: false, query: "", start: 0, end: 0, index: 0 };

export function MentionEditor({
  value,
  onChange,
  roster,
  rows = 5,
  placeholder,
  className = "",
}: MentionEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [popup, setPopup] = useState<PopupState>(initial);

  const matches = popup.open
    ? roster
        .filter((r) => (r.full_name ?? "").toLowerCase().includes(popup.query.toLowerCase()))
        .slice(0, 8)
    : [];

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    onChange(next);
    detect(next, e.target.selectionStart);
  }

  function detect(text: string, caret: number) {
    const before = text.slice(0, caret);
    const m = before.match(/@([a-zA-Z][a-zA-Z\s'.-]{0,40})$/);
    if (!m) {
      setPopup(initial);
      return;
    }
    const start = caret - m[0].length;
    setPopup({ open: true, query: m[1] ?? "", start, end: caret, index: 0 });
  }

  function pick(member: RosterMember) {
    const ta = taRef.current;
    if (!ta) return;
    const insert = `@[${member.full_name}](${member.user_id}) `;
    const next = value.slice(0, popup.start) + insert + value.slice(popup.end);
    onChange(next);
    setPopup(initial);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = popup.start + insert.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!popup.open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPopup((p) => ({ ...p, index: (p.index + 1) % matches.length }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPopup((p) => ({ ...p, index: (p.index - 1 + matches.length) % matches.length }));
    } else if (e.key === "Enter" || e.key === "Tab") {
      const m = matches[popup.index];
      if (m) {
        e.preventDefault();
        pick(m);
      }
    } else if (e.key === "Escape") {
      setPopup(initial);
    }
  }

  // Close popup on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (taRef.current && !taRef.current.parentElement?.contains(e.target as Node)) {
        setPopup(initial);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={taRef}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className={`border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm ${className}`}
      />
      {popup.open && matches.length > 0 && (
        <ul className="border-line bg-bg absolute left-3 top-full z-30 mt-1 w-64 overflow-hidden rounded-md border shadow-lg">
          {matches.map((m, i) => (
            <li key={m.user_id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(m);
                }}
                className={`w-full px-3 py-1.5 text-left text-sm ${
                  i === popup.index ? "bg-input-bg text-ink" : "text-muted hover:bg-input-bg"
                }`}
              >
                {m.full_name}
                <span className="text-muted ml-2 text-xs">{m.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
