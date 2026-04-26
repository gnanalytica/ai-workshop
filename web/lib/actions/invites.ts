"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const baseSchema = z.object({
  kind: z.enum(["student", "faculty", "staff"]),
  cohort_id: z.string().uuid().nullable().optional(),
  college_role: z.enum(["support", "executive"]).nullable().optional(),
  staff_role: z.enum(["admin", "trainer", "tech_support"]).nullable().optional(),
  max_uses: z.coerce.number().int().min(1).max(1000).default(1),
  expires_at: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

const createSchema = baseSchema.superRefine((v, ctx) => {
  if (v.kind === "student" && !v.cohort_id) {
    ctx.addIssue({ code: "custom", path: ["cohort_id"], message: "Cohort required" });
  }
  if (v.kind === "faculty" && !v.cohort_id) {
    ctx.addIssue({ code: "custom", path: ["cohort_id"], message: "Cohort required" });
  }
  if (v.kind === "staff" && !v.staff_role) {
    ctx.addIssue({ code: "custom", path: ["staff_role"], message: "Staff role required" });
  }
});

function generateCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous chars
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${suffix}`;
}

export async function createInvite(input: z.infer<typeof baseSchema>) {
  await requireCapability("orgs.write");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const v = parsed.data;
  const prefix =
    v.kind === "student" ? "STU" : v.kind === "faculty" ? "FAC" : v.staff_role!.slice(0, 3).toUpperCase();
  const code = generateCode(prefix);

  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("invites")
    .insert({
      code,
      kind: v.kind,
      cohort_id: v.kind === "staff" ? null : v.cohort_id ?? null,
      // Faculty role distinction (support vs executive) collapsed in
      // 0019_unify_faculty_role; we always store 'support' for new invites.
      college_role: v.kind === "faculty" ? "support" : null,
      staff_role: v.kind === "staff" ? v.staff_role ?? null : null,
      max_uses: v.max_uses,
      expires_at: v.expires_at || null,
      note: v.note || null,
    })
    .select("id, code")
    .single();
  if (error) return actionFail(error.message);
  revalidatePath("/admin/invites");
  return actionOk(data);
}

export async function deleteInvite(id: string) {
  await requireCapability("orgs.write");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return actionFail("Invalid id");
  const sb = await getSupabaseServer();
  const { error } = await sb.from("invites").delete().eq("id", id);
  if (error) return actionFail(error.message);
  revalidatePath("/admin/invites");
  return actionOk();
}
