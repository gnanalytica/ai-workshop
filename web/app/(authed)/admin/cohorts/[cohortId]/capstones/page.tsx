import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { CohortShell } from "@/components/admin-cohort/CohortShell";
import { Card, CardSub } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCohortById } from "@/lib/queries/admin-context";
import { listCohortCapstones } from "@/lib/queries/capstone";
import { relTime } from "@/lib/format";

export default async function AdminCohortCapstonesPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  await requireCapability("roster.read", cohortId);
  const cohort = await getAdminCohortById(cohortId);
  if (!cohort) notFound();

  const rows = await listCohortCapstones(cohort.id);

  const summary = rows.reduce(
    (acc, r) => {
      const s = r.project?.status ?? "none";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <CohortShell cohort={cohort} active="capstones" />

      <section className="mt-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Capstones</h2>
            <p className="text-muted text-sm">
              One project per student. Milestone progress reflects published grades.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>None: {summary.none ?? 0}</Badge>
            <Badge>Exploring: {summary.exploring ?? 0}</Badge>
            <Badge variant="warn">Locked: {summary.locked ?? 0}</Badge>
            <Badge variant="accent">Building: {summary.building ?? 0}</Badge>
            <Badge variant="ok">Shipped: {summary.shipped ?? 0}</Badge>
          </div>
        </div>

        {rows.length === 0 ? (
          <Card><CardSub>No confirmed students in this cohort yet.</CardSub></Card>
        ) : (
          <div className="border-line overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-bg-soft text-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="w-28 px-3 py-2 text-left">Status</th>
                  <th className="w-28 px-3 py-2 text-right">Milestones</th>
                  <th className="w-28 px-3 py-2 text-left">Repo</th>
                  <th className="w-28 px-3 py-2 text-left">Demo</th>
                  <th className="w-28 px-3 py-2 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const p = r.project;
                  return (
                    <tr key={r.user_id} className="border-line border-t">
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/cohorts/${cohort.id}/students/${r.user_id}`}
                          className="text-accent hover:underline"
                        >
                          {r.user_name ?? r.user_email ?? "—"}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {p?.title ?? <span className="text-muted italic">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        {p ? <Badge>{p.status}</Badge> : <span className="text-muted text-xs">—</span>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {r.milestones_done} / {r.milestones_total}
                      </td>
                      <td className="px-3 py-2">
                        {p?.repo_url ? (
                          <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline">
                            repo ↗
                          </a>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {p?.demo_url ? (
                          <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline">
                            demo ↗
                          </a>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="text-muted px-3 py-2 text-right text-xs">
                        {p?.updated_at ? relTime(p.updated_at) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
