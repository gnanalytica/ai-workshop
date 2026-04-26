"use server";

import { z } from "zod";
import { requireCapability } from "@/lib/auth/requireCapability";
import { withSupabase, actionFail } from "./_helpers";

const orgSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
});

export async function createOrg(input: z.infer<typeof orgSchema>) {
  const parsed = orgSchema.safeParse(input);
  if (!parsed.success) return actionFail("Slug must be lowercase + dashes; name 2–120 chars");
  await requireCapability("orgs.write");
  return withSupabase(
    (sb) =>
      sb
        .from("organizations")
        .insert({ slug: parsed.data.slug, name: parsed.data.name })
        .select()
        .single(),
    "/admin/orgs",
  );
}

const promoSchema = z.object({
  code: z.string().min(3).max(40).regex(/^[A-Z0-9_-]+$/),
  organization_id: z.string().uuid().nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_until: z.string().nullable().optional(),
});

export async function createPromo(input: z.infer<typeof promoSchema>) {
  const parsed = promoSchema.safeParse(input);
  if (!parsed.success) return actionFail("Code must be UPPERCASE/numbers/_-");
  await requireCapability("orgs.write");
  return withSupabase(
    (sb) =>
      sb
        .from("promo_codes")
        .insert({
          code: parsed.data.code,
          organization_id: parsed.data.organization_id ?? null,
          max_uses: parsed.data.max_uses ?? null,
          valid_until: parsed.data.valid_until ?? null,
        })
        .select()
        .single(),
    "/admin/orgs",
  );
}
