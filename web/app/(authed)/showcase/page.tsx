import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";

interface ShowcaseRow {
  id: string;
  title: string;
  owner_name: string | null;
  demo_url: string | null;
  repo_url: string | null;
  updated_at: string;
}

async function listShippedCapstones(): Promise<ShowcaseRow[]> {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("capstone_projects")
    .select(
      "id, title, demo_url, repo_url, updated_at, profiles:user_id(full_name)",
    )
    .eq("status", "shipped")
    .order("updated_at", { ascending: false })
    .limit(60);
  type Row = {
    id: string;
    title: string | null;
    demo_url: string | null;
    repo_url: string | null;
    updated_at: string;
    profiles: { full_name: string | null } | null;
  };
  return ((data ?? []) as unknown as Row[]).map((c) => ({
    id: c.id,
    title: c.title ?? "Untitled",
    owner_name: c.profiles?.full_name ?? null,
    demo_url: c.demo_url,
    repo_url: c.repo_url,
    updated_at: c.updated_at,
  }));
}

export default async function ShowcasePage() {
  const capstones = await listShippedCapstones();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Showcase</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Capstones, on display</h1>
        <CardSub className="mt-1">{capstones.length} shipped capstones</CardSub>
      </header>

      {capstones.length === 0 ? (
        <Card>
          <CardTitle>Nothing shipped yet</CardTitle>
          <CardSub className="mt-2">
            Once cohorts ship their demos, the public ones will appear here.
          </CardSub>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capstones.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle className="break-words">{c.title}</CardTitle>
                <Badge variant="ok">Shipped</Badge>
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
