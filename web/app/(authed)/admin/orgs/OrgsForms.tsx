"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrg, createPromo } from "@/lib/actions/orgs";

export function NewOrgForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const r = await createOrg({ name: name.trim(), slug: slug.trim() });
      if (r.ok) {
        toast.success("Organization created");
        setName("");
        setSlug("");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-5">
      <CardTitle>New organization</CardTitle>
      <Input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""));
        }}
        placeholder="Name (e.g. Acme University)"
      />
      <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (lowercase-dashes)" />
      <Button onClick={submit} disabled={pending || !name || !slug}>
        {pending ? "Creating…" : "Create"}
      </Button>
    </Card>
  );
}

export function NewPromoForm({ orgs }: { orgs: { id: string; name: string }[] }) {
  const [code, setCode] = useState("");
  const [orgId, setOrgId] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const r = await createPromo({
        code: code.trim().toUpperCase(),
        organization_id: orgId || null,
        max_uses: maxUses ? Number(maxUses) : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      });
      if (r.ok) {
        toast.success("Promo code created");
        setCode("");
        setOrgId("");
        setMaxUses("");
        setValidUntil("");
      } else toast.error(r.error);
    });
  }

  return (
    <Card className="space-y-3 p-5">
      <CardTitle>New promo code</CardTitle>
      <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE-2026" />
      <select
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        className="border-line bg-input-bg text-ink rounded-md border px-3 py-2 text-sm"
      >
        <option value="">— No organization —</option>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Max uses (blank = ∞)" inputMode="numeric" />
        <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
      </div>
      <Button onClick={submit} disabled={pending || !code}>
        {pending ? "Creating…" : "Create"}
      </Button>
    </Card>
  );
}
