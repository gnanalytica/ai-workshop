import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface RubricCriterion {
  key: string;
  name: string;
  max: number;
  anchors: Record<string, string>;
}

export interface RubricAutoGradeHints {
  red_flags?: string[];
  evidence_required?: string[];
}

export interface RubricCriteriaPayload {
  criteria: RubricCriterion[];
  scale_max: number;
  auto_grade_hints?: RubricAutoGradeHints;
}

export interface RubricRow {
  id: string;
  title: string;
  criteria: RubricCriteriaPayload;
}

/**
 * Fetches the rubric_templates rows for the given ids. Returned as a Map
 * keyed by id so the curriculum page can splice rubrics into per-assignment
 * rows without N+1 fetches.
 */
export const listRubricsByIds = cache(
  async (ids: ReadonlyArray<string>): Promise<Map<string, RubricRow>> => {
    const out = new Map<string, RubricRow>();
    if (ids.length === 0) return out;
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("rubric_templates")
      .select("id, title, criteria")
      .in("id", ids);
    for (const r of (data ?? []) as Array<{
      id: string;
      title: string;
      criteria: unknown;
    }>) {
      out.set(r.id, {
        id: r.id,
        title: r.title,
        criteria: normalizeCriteria(r.criteria),
      });
    }
    return out;
  },
);

/**
 * Coerce the `criteria` jsonb into the canonical RubricCriteriaPayload shape.
 * Legacy rows might be missing `auto_grade_hints` or be wrapped differently —
 * this normalizer gives the UI a stable shape to render.
 */
function normalizeCriteria(raw: unknown): RubricCriteriaPayload {
  if (!raw || typeof raw !== "object") {
    return { criteria: [], scale_max: 0 };
  }
  const obj = raw as Record<string, unknown>;
  const criteriaRaw = Array.isArray(obj.criteria) ? obj.criteria : [];
  const criteria: RubricCriterion[] = criteriaRaw.map((c) => {
    const co = (c ?? {}) as Record<string, unknown>;
    const anchorsRaw = (co.anchors ?? {}) as Record<string, unknown>;
    const anchors: Record<string, string> = {};
    for (const [k, v] of Object.entries(anchorsRaw)) {
      anchors[k] = typeof v === "string" ? v : String(v ?? "");
    }
    return {
      key: typeof co.key === "string" ? co.key : "",
      name: typeof co.name === "string" ? co.name : "",
      max: typeof co.max === "number" ? co.max : Number(co.max ?? 0),
      anchors,
    };
  });
  const scaleMax =
    typeof obj.scale_max === "number"
      ? obj.scale_max
      : criteria.reduce((s, c) => s + (c.max || 0), 0);
  return {
    criteria,
    scale_max: scaleMax,
    auto_grade_hints:
      obj.auto_grade_hints && typeof obj.auto_grade_hints === "object"
        ? (obj.auto_grade_hints as RubricAutoGradeHints)
        : undefined,
  };
}
