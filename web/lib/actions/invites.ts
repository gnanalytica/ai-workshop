"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSupabaseServer } from "@/lib/supabase/server";
import { actionFail, actionOk } from "./_helpers";

const baseSchema = z.object({
  kind: z.enum(["student", "faculty", "staff"]),
  cohort_id: z.string().uuid().nullable().optional(),
  staff_role: z.enum(["admin"]).nullable().optional(),
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
    v.kind === "student" ? "STU" : v.kind === "faculty" ? "FAC" : "ADM";

  const sb = await getSupabaseServer();
  const row = {
    kind: v.kind,
    cohort_id: v.kind === "staff" ? null : v.cohort_id ?? null,
    staff_role: v.kind === "staff" ? v.staff_role ?? "admin" : null,
    max_uses: v.max_uses,
    expires_at: v.expires_at || null,
    note: v.note || null,
  };

  // Retry on the unique-constraint collision (extremely rare given 32^6 suffix
  // space, but the cost of a single retry is trivial and the cost of a hard
  // failure to the admin is real).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode(prefix);
    const { data, error } = await sb
      .from("invites")
      .insert({ ...row, code })
      .select("id, code")
      .single();
    if (!error) {
      revalidatePath("/admin/invites");
      return actionOk(data);
    }
    // Postgres unique_violation = 23505. Anything else is a real error.
    if (error.code !== "23505") return actionFail(error.message);
  }
  return actionFail("Could not allocate a unique invite code. Please try again.");
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
