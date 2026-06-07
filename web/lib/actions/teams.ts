"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireCapability } from "@/lib/auth/requireCapability";
import { actionOk, actionFail, withSupabase, type ActionResult } from "./_helpers";

const githubRe = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/?$/;
const httpOpt = (msg = "Must start with http(s)://") =>
  z.string().trim().max(500).optional().nullable().refine((v) => !v || /^https?:\/\//.test(v), msg);

// ---------------------------------------------------------------------------
// Member-facing: edit the shared team deliverable.
// ---------------------------------------------------------------------------

const submissionSchema = z.object({
  team_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  title: z.string().trim().max(140).optional().nullable(),
  pitch: z.string().trim().max(280).optional().nullable(),
  chosen_idea: z.string().trim().max(280).optional().nullable(),
  presentation_url: httpOpt(),
  product_url: httpOpt(),
  demo_video_url: httpOpt(),
  cover_image_url: httpOpt(),
  repo_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .refine((v) => !v || githubRe.test(v), "Repo URL must look like https://github.com/owner/repo"),
  status: z.enum(["draft", "submitted"]).optional(),
});

const clean = (v: string | null | undefined) => (v && v.length ? v : null);

export async function upsertTeamSubmission(
  input: z.infer<typeof submissionSchema>,
): Promise<ActionResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
  const d = parsed.data;

  const result = await withSupabase(async (sb) => {
    return sb
      .from("team_submissions")
      .upsert(
        {
          team_id: d.team_id,
          cohort_id: d.cohort_id,
          title: clean(d.title),
          pitch: clean(d.pitch),
          chosen_idea: clean(d.chosen_idea),
          presentation_url: clean(d.presentation_url),
          product_url: clean(d.product_url),
          demo_video_url: clean(d.demo_video_url),
          cover_image_url: clean(d.cover_image_url),
          repo_url: clean(d.repo_url),
          ...(d.status ? { status: d.status } : {}),
        },
        { onConflict: "team_id" },
      )
      .select()
      .single();
  });
  revalidatePath("/capstone");
  revalidatePath("/showcase");
  return result;
}

/** Flip submitted/draft without re-sending the whole form. */
export async function setTeamSubmissionStatus(input: {
  team_id: string;
  cohort_id: string;
  status: "draft" | "submitted";
}): Promise<ActionResult> {
  const schema = z.object({
    team_id: z.string().uuid(),
    cohort_id: z.string().uuid(),
    status: z.enum(["draft", "submitted"]),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");
  const result = await withSupabase(async (sb) =>
    sb
      .from("team_submissions")
      .upsert(
        { team_id: parsed.data.team_id, cohort_id: parsed.data.cohort_id, status: parsed.data.status },
        { onConflict: "team_id" },
      )
      .select()
      .single(),
  );
  revalidatePath("/capstone");
  revalidatePath("/showcase");
  return result;
}

// ---------------------------------------------------------------------------
// Admin-facing: import teams, grade, set deadline, reopen.
// ---------------------------------------------------------------------------

const importSchema = z.object({
  cohort_id: z.string().uuid(),
  rows: z
    .array(
      z.object({
        team_number: z.number().int().positive().optional().nullable(),
        name: z.string().trim().min(1).max(80),
        roll_numbers: z.array(z.string().trim().min(1)).min(1).max(8),
        ideas: z.array(z.string().trim().min(1)).max(5),
      }),
    )
    .min(1)
    .max(200),
});

export interface ImportRowResult {
  name: string;
  matched: number;
  unmatched: string[];
  error?: string;
}

export async function importTeams(
  input: z.infer<typeof importSchema>,
): Promise<ActionResult<{ rows: ImportRowResult[] }>> {
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "Invalid CSV");
  const { cohort_id, rows } = parsed.data;

  await requireCapability("roster.write", cohort_id);
  const sb = await getSupabaseServer();

  // Resolve roll numbers → user_id for all confirmed students in the cohort.
  const { data: regs, error: regErr } = await sb
    .from("registrations")
    .select("user_id, roll_number")
    .eq("cohort_id", cohort_id)
    .eq("status", "confirmed")
    .not("roll_number", "is", null);
  if (regErr) return actionFail(regErr.message);

  const byRoll = new Map<string, string>();
  for (const r of (regs ?? []) as Array<{ user_id: string; roll_number: string }>) {
    byRoll.set(r.roll_number.trim().toLowerCase(), r.user_id);
  }

  const report: ImportRowResult[] = [];
  for (const row of rows) {
    const matchedIds: string[] = [];
    const unmatched: string[] = [];
    for (const roll of row.roll_numbers) {
      const uid = byRoll.get(roll.trim().toLowerCase());
      if (uid) matchedIds.push(uid);
      else unmatched.push(roll);
    }

    const { data: team, error: teamErr } = await sb
      .from("teams")
      .upsert(
        {
          cohort_id,
          name: row.name,
          team_number: row.team_number ?? null,
          pitched_ideas: row.ideas,
        },
        { onConflict: "cohort_id,name" },
      )
      .select("id")
      .single();
    if (teamErr || !team) {
      report.push({ name: row.name, matched: 0, unmatched: row.roll_numbers, error: teamErr?.message ?? "Could not create team" });
      continue;
    }

    const teamId = (team as { id: string }).id;
    await sb.from("team_members").delete().eq("team_id", teamId);
    const uniqueIds = [...new Set(matchedIds)];
    if (uniqueIds.length) {
      const { error: memErr } = await sb
        .from("team_members")
        .insert(uniqueIds.map((user_id) => ({ team_id: teamId, user_id })));
      if (memErr) {
        report.push({ name: row.name, matched: 0, unmatched: row.roll_numbers, error: memErr.message });
        continue;
      }
    }
    report.push({ name: row.name, matched: uniqueIds.length, unmatched });
  }

  revalidatePath(`/admin/cohorts/${cohort_id}/teams`);
  revalidatePath("/showcase");
  return actionOk({ rows: report });
}

export async function gradeTeam(input: {
  team_id: string;
  cohort_id: string;
  score: number | null;
  feedback_md: string | null;
}): Promise<ActionResult> {
  const schema = z.object({
    team_id: z.string().uuid(),
    cohort_id: z.string().uuid(),
    score: z.number().int().min(0).max(100).nullable(),
    feedback_md: z.string().trim().max(4000).nullable(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireCapability("grading.write:cohort", parsed.data.cohort_id);
  const user = await getSession();
  if (!user) return actionFail("Not signed in");

  const result = await withSupabase(async (sb) =>
    sb
      .from("team_grades")
      .upsert(
        {
          team_id: parsed.data.team_id,
          cohort_id: parsed.data.cohort_id,
          score: parsed.data.score,
          feedback_md: clean(parsed.data.feedback_md),
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        },
        { onConflict: "team_id" },
      )
      .select()
      .single(),
  );
  revalidatePath(`/admin/cohorts/${parsed.data.cohort_id}/teams`);
  revalidatePath("/capstone");
  return result;
}

export async function setTeamDeadline(input: {
  cohort_id: string;
  deadline: string | null;
}): Promise<ActionResult> {
  const schema = z.object({
    cohort_id: z.string().uuid(),
    deadline: z.string().datetime().nullable(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid date");

  await requireCapability("roster.write", parsed.data.cohort_id);
  const result = await withSupabase(async (sb) =>
    sb
      .from("cohorts")
      .update({ team_submission_deadline: parsed.data.deadline })
      .eq("id", parsed.data.cohort_id)
      .select("id")
      .single(),
  );
  revalidatePath(`/admin/cohorts/${parsed.data.cohort_id}/teams`);
  return result;
}

/** Admin override: reopen (or re-lock) a single team's submission after deadline. */
export async function setTeamUnlocked(input: {
  team_id: string;
  cohort_id: string;
  unlocked: boolean;
}): Promise<ActionResult> {
  const schema = z.object({
    team_id: z.string().uuid(),
    cohort_id: z.string().uuid(),
    unlocked: z.boolean(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return actionFail("Invalid input");

  await requireCapability("roster.write", parsed.data.cohort_id);
  const result = await withSupabase(async (sb) =>
    sb
      .from("team_submissions")
      .upsert(
        { team_id: parsed.data.team_id, cohort_id: parsed.data.cohort_id, unlocked: parsed.data.unlocked },
        { onConflict: "team_id" },
      )
      .select()
      .single(),
  );
  revalidatePath(`/admin/cohorts/${parsed.data.cohort_id}/teams`);
  return result;
}
