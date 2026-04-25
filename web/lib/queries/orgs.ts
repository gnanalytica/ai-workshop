import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface OrgRow {
  id: string;
  slug: string;
  name: string;
  promo_count: number;
}

export interface PromoRow {
  code: string;
  organization_id: string | null;
  org_name: string | null;
  uses: number;
  max_uses: number | null;
  valid_until: string | null;
}

export const listOrgs = cache(async (): Promise<OrgRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("organizations")
    .select("id, slug, name, promo_codes(count)")
    .order("name");
  return ((data ?? []) as unknown as Array<{
    id: string; slug: string; name: string;
    promo_codes: Array<{ count: number }>;
  }>).map((o) => ({
    id: o.id,
    slug: o.slug,
    name: o.name,
    promo_count: o.promo_codes?.[0]?.count ?? 0,
  }));
});

export const listPromos = cache(async (): Promise<PromoRow[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("promo_codes")
    .select("code, organization_id, uses, max_uses, valid_until, organizations(name)")
    .order("code");
  return ((data ?? []) as unknown as Array<{
    code: string; organization_id: string | null; uses: number;
    max_uses: number | null; valid_until: string | null;
    organizations: { name: string } | null;
  }>).map((p) => ({
    code: p.code,
    organization_id: p.organization_id,
    org_name: p.organizations?.name ?? null,
    uses: p.uses,
    max_uses: p.max_uses,
    valid_until: p.valid_until,
  }));
});
