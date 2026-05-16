"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateRubric } from "@/lib/actions/rubrics";
import type {
  RubricCriterion,
  RubricRow,
} from "@/lib/queries/rubrics";

function emptyAnchors(max: number): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i <= max; i++) out[String(i)] = "";
  return out;
}

function reshapeAnchors(
  current: Record<string, string>,
  max: number,
): Record<string, string> {
  // Keep anchors for levels 0..max; drop higher; default missing to "".
  const out: Record<string, string> = {};
  for (let i = 0; i <= max; i++) {
    out[String(i)] = current[String(i)] ?? "";
  }
  return out;
}

const slugKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "criterion";

export function RubricEditor({
  cohortId,
  rubric,
}: {
  cohortId: string;
  rubric: RubricRow;
}) {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    rubric.criteria.criteria,
  );
  const [pending, start] = useTransition();

  const scaleMax = useMemo(
    () => criteria.reduce((s, c) => s + (c.max || 0), 0),
    [criteria],
  );

  function patch(i: number, next: Partial<RubricCriterion>) {
    setCriteria((rows) => {
      const out = rows.slice();
      const cur = { ...out[i]!, ...next };
      if (next.max !== undefined && next.max !== out[i]!.max) {
        cur.anchors = reshapeAnchors(cur.anchors, cur.max);
      }
      out[i] = cur;
      return out;
    });
  }

  function patchAnchor(i: number, level: string, text: string) {
    setCriteria((rows) => {
      const out = rows.slice();
      out[i] = { ...out[i]!, anchors: { ...out[i]!.anchors, [level]: text } };
      return out;
    });
  }

  function addCriterion() {
    const max = 2;
    setCriteria((rows) => [
      ...rows,
      {
        key: `criterion_${rows.length + 1}`,
        name: "",
        max,
        anchors: emptyAnchors(max),
      },
    ]);
  }

  function removeCriterion(i: number) {
    setCriteria((rows) => rows.filter((_, idx) => idx !== i));
  }

  function save() {
    // Trim, autoslug missing keys, basic validation.
    const cleaned: RubricCriterion[] = criteria.map((c) => ({
      key: c.key.trim() || slugKey(c.name),
      name: c.name.trim(),
      max: Math.max(1, Math.min(20, Math.round(c.max || 1))),
      anchors: c.anchors,
    }));
    const blanks = cleaned.filter((c) => !c.name);
    if (blanks.length > 0) {
      toast.error("Every criterion needs a name");
      return;
    }
    if (cleaned.length === 0) {
      toast.error("At least one criterion required");
      return;
    }
    start(async () => {
      const r = await updateRubric({
        rubric_id: rubric.id,
        cohort_id: cohortId,
        criteria: cleaned,
        auto_grade_hints: rubric.criteria.auto_grade_hints,
      });
      if (r.ok) toast.success("Rubric saved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="text-muted flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="font-mono uppercase tracking-[0.18em]">
          {rubric.title}
        </span>
        <span>
          <Badge variant={scaleMax === 10 ? "ok" : "warn"}>
            total {scaleMax} pts
          </Badge>
        </span>
      </div>

      <ul className="space-y-3">
        {criteria.map((c, i) => (
          <li
            key={i}
            className="border-line bg-bg-soft/40 space-y-2 rounded-md border p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={c.name}
                onChange={(e) => patch(i, { name: e.target.value })}
                placeholder="Criterion name"
                className="flex-1 min-w-[180px]"
              />
              <label className="text-muted flex items-center gap-1 text-xs">
                Max
                <Input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  value={c.max}
                  onChange={(e) =>
                    patch(i, { max: Number(e.target.value) || 1 })
                  }
                  className="w-16"
                />
                <span className="text-muted">pts</span>
              </label>
              <button
                type="button"
                onClick={() => removeCriterion(i)}
                disabled={pending}
                className="text-muted hover:text-danger text-xs underline-offset-2 hover:underline disabled:opacity-50"
              >
                remove
              </button>
            </div>
            <div className="grid gap-1">
              {Array.from({ length: c.max + 1 }, (_, lv) => (
                <div
                  key={lv}
                  className="grid grid-cols-[auto_1fr] items-start gap-2"
                >
                  <span className="text-muted shrink-0 pt-2 font-mono text-[11px] tabular-nums">
                    {lv}
                  </span>
                  <textarea
                    rows={1}
                    value={c.anchors[String(lv)] ?? ""}
                    onChange={(e) =>
                      patchAnchor(i, String(lv), e.target.value)
                    }
                    placeholder={`What earns ${lv} ${lv === 1 ? "point" : "points"}`}
                    className="border-line bg-input-bg text-ink w-full resize-y rounded-md border px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCriterion}
          disabled={pending}
        >
          + Add criterion
        </Button>
        <Button type="button" onClick={save} disabled={pending} size="sm">
          {pending ? "Saving…" : "Save rubric"}
        </Button>
      </div>
    </div>
  );
}
