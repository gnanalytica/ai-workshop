"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { setPreviewAs, searchPreviewUsers } from "@/lib/actions/preview-as";
import type { PreviewCohortOption, PreviewUserOption } from "@/lib/actions/preview-as.types";
import type { Persona } from "@/lib/auth/persona";

interface Props {
  effective: Persona;
  cohorts: PreviewCohortOption[];
  previewCohortId: string | null;
  previewCohortName: string | null;
  previewUserId: string | null;
  previewUserName: string | null;
}

const selectCls =
  "border-line bg-input-bg text-ink rounded-md border px-2 py-1 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]";

export function PreviewAsSwitcher({
  effective,
  cohorts,
  previewCohortId,
  previewCohortName,
  previewUserId,
  previewUserName,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [search, setSearch] = useState(previewUserName ?? "");
  const [matches, setMatches] = useState<PreviewUserOption[]>([]);
  const [, startTx] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(previewUserId ?? null);

  useEffect(() => {
    if (effective !== "student") return;
    const term = search.trim();
    if (term.length < 2) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    startTx(() => {
      searchPreviewUsers(term).then((rows) => {
        if (!cancelled) setMatches(rows);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [search, effective]);

  return (
    <div className="flex flex-col items-end gap-1">
      <form ref={formRef} action={setPreviewAs} className="flex items-center gap-2">
        <label htmlFor="persona" className="text-muted text-xs tracking-wide uppercase">
          View as
        </label>
        <select
          id="persona"
          name="persona"
          defaultValue={effective}
          onChange={() => formRef.current?.requestSubmit()}
          className={selectCls}
        >
          <option value="admin">Admin</option>
          <option value="faculty">Faculty (preview)</option>
          <option value="student">Student (preview)</option>
        </select>

        {effective === "faculty" && (
          <select
            name="cohortId"
            defaultValue={previewCohortId ?? ""}
            onChange={() => formRef.current?.requestSubmit()}
            className={selectCls}
            aria-label="Preview cohort"
          >
            <option value="">— pick cohort —</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {effective === "student" && (
          <>
            <input
              name="search"
              type="search"
              list={listId}
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                const hit = matches.find(
                  (m) => `${m.full_name ?? m.email}` === v || m.email === v,
                );
                if (hit) {
                  setPendingUserId(hit.id);
                  // submit on confirmed pick
                  requestAnimationFrame(() => formRef.current?.requestSubmit());
                }
              }}
              placeholder="Search student…"
              className={selectCls}
              aria-label="Preview student"
            />
            <datalist id={listId}>
              {matches.map((m) => (
                <option
                  key={m.id}
                  value={m.full_name ? `${m.full_name}` : m.email}
                  label={m.email}
                />
              ))}
            </datalist>
            <input type="hidden" name="userId" value={pendingUserId ?? ""} />
          </>
        )}
      </form>
      {effective === "faculty" && previewCohortName && (
        <span className="text-muted text-[10px] tracking-wide uppercase">
          Preview cohort: {previewCohortName}
        </span>
      )}
      {effective === "student" && previewUserName && (
        <span className="text-muted text-[10px] tracking-wide uppercase">
          Preview user: {previewUserName}
        </span>
      )}
    </div>
  );
}
