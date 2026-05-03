import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPublicCapstones } from "@/lib/queries/capstones";
import { fmtDate } from "@/lib/format";

export default async function ShowcasePage() {
  const capstones = await listPublicCapstones();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Showcase</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Capstones, on display</h1>
        <CardSub className="mt-1">{capstones.length} public capstones</CardSub>
      </header>

      {capstones.length === 0 ? (
        <Card>
          <CardTitle>Nothing public yet</CardTitle>
          <CardSub className="mt-2">
            Once cohorts publish their demos, the public ones will appear here.
          </CardSub>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capstones.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle className="break-words">{c.title}</CardTitle>
                <Badge variant="accent">{c.phase}</Badge>
              </div>
              <p className="text-muted mt-1 text-sm">By {c.owner_name ?? "—"}</p>
              <p className="text-muted mt-2 text-xs">Updated {fmtDate(c.updated_at)}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {c.demo_url && (
                  <Link className="text-accent hover:underline" href={c.demo_url} target="_blank" rel="noreferrer">
                    Demo →
                  </Link>
                )}
                {c.repo_url && (
                  <Link className="text-accent hover:underline" href={c.repo_url} target="_blank" rel="noreferrer">
                    Repo →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
