import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort } from "@/lib/queries/faculty";
import { listFacultyHelpDesk } from "@/lib/queries/faculty-help-desk";
import { relTime } from "@/lib/format";
import { HelpDeskScopeNotice } from "../HelpDeskScopeNotice";

const PAGE_SIZE = 20;

export default async function FacultyStuckHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCapability("support.triage");
  const f = await getFacultyCohort();
  const me = await getSession();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;

  const sp = await searchParams;
  const requested = Number.parseInt(sp.page ?? "1", 10);
  const items = await listFacultyHelpDesk(f.cohort.id, me.id);
  const resolved = items
    .filter((i) => i.status === "resolved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = resolved.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const slice = resolved.slice(start, start + PAGE_SIZE);

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · Help desk · resolved
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Resolved tickets</h1>
          <Link
            href="/faculty/help-desk"
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            ← Back to help desk
          </Link>
        </div>
        <p className="text-muted mt-1 text-sm">
          History of resolved tickets from students in your pod.
        </p>
      </header>

      <HelpDeskScopeNotice />

      {total === 0 ? (
        <Card>
          <CardSub>No resolved tickets yet.</CardSub>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {slice.map((s) => {
              const preview = s.message ? s.message.slice(0, 120) : null;
              const truncated = !!s.message && s.message.length > 120;
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-ink text-sm font-medium">{s.user_name ?? "—"}</span>
                    {s.pod_name && <Badge>{s.pod_name}</Badge>}
                    <Badge variant={s.kind === "tech" ? "danger" : "warn"}>{s.kind}</Badge>
                    <span className="text-muted ml-auto text-xs">{relTime(s.created_at)}</span>
                  </div>
                  {preview && (
                    <p className="text-ink/85 mt-2 text-sm">
                      {preview}
                      {truncated && <span className="text-muted">…</span>}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-muted text-xs">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              {prevDisabled ? (
                <span className="border-line text-muted cursor-not-allowed rounded-md border px-3 py-1.5 text-sm opacity-60">
                  ← Prev
                </span>
              ) : (
                <Link
                  href={`/faculty/help-desk/history?page=${page - 1}`}
                  className="border-line text-ink hover:bg-input-bg rounded-md border px-3 py-1.5 text-sm"
                >
                  ← Prev
                </Link>
              )}
              {nextDisabled ? (
                <span className="border-line text-muted cursor-not-allowed rounded-md border px-3 py-1.5 text-sm opacity-60">
                  Next →
                </span>
              ) : (
                <Link
                  href={`/faculty/help-desk/history?page=${page + 1}`}
                  className="border-line text-ink hover:bg-input-bg rounded-md border px-3 py-1.5 text-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
