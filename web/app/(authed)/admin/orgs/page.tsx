import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listOrgs, listPromos } from "@/lib/queries/orgs";
import { fmtDate } from "@/lib/format";
import { NewOrgForm, NewPromoForm } from "./OrgsForms";

export default async function AdminOrgsPage() {
  await requireCapability("orgs.write");
  const [orgs, promos] = await Promise.all([listOrgs(), listPromos()]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Organizations</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Customers &amp; promo codes</h1>
        <CardSub className="mt-1">{orgs.length} organizations · {promos.length} promo codes</CardSub>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <NewOrgForm />
        <NewPromoForm orgs={orgs.map((o) => ({ id: o.id, name: o.name }))} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Organizations</h2>
        {orgs.length === 0 ? (
          <Card><CardSub>None yet.</CardSub></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((o) => (
              <Card key={o.id} className="p-4">
                <CardTitle>{o.name}</CardTitle>
                <p className="text-muted mt-1 font-mono text-xs">{o.slug}</p>
                <Badge className="mt-3">{o.promo_count} codes</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Promo codes</h2>
        {promos.length === 0 ? (
          <Card><CardSub>No promo codes.</CardSub></Card>
        ) : (
          <div className="border-line overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Organization</th>
                  <th className="px-3 py-2 text-right">Used</th>
                  <th className="px-3 py-2 text-right">Cap</th>
                  <th className="px-3 py-2 text-left">Valid until</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.code} className="border-line border-t">
                    <td className="px-3 py-2 font-mono">{p.code}</td>
                    <td className="px-3 py-2">{p.org_name ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.uses}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.max_uses ?? "∞"}</td>
                    <td className="text-muted px-3 py-2 text-xs">
                      {p.valid_until ? fmtDate(p.valid_until) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
