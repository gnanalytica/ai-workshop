import { requireCapability } from "@/lib/auth/requireCapability";
import { listCohortsForInvites, listInvites } from "@/lib/queries/invites";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { CreateInviteForm } from "./CreateInviteForm";
import { InviteRowActions } from "./InviteRowActions";

export default async function AdminInvitesPage() {
  await requireCapability("orgs.write");
  const [invites, cohorts] = await Promise.all([listInvites(), listCohortsForInvites()]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Invites</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Sign-up invite codes</h1>
        <p className="text-muted mt-1 text-sm">
          Issue codes for students (per cohort), faculty (per cohort + role), and staff (admin /
          trainer / tech_support).
        </p>
      </header>

      <Card>
        <CardTitle>Create invite</CardTitle>
        <CardSub className="mt-1 mb-4">
          Codes are auto-generated. Single-use by default.
        </CardSub>
        <CreateInviteForm cohorts={cohorts} />
      </Card>

      <Card>
        <CardTitle>All invites</CardTitle>
        {invites.length === 0 ? (
          <CardSub className="mt-2">No invites yet.</CardSub>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted text-left text-xs tracking-wide uppercase">
                <tr>
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Kind</th>
                  <th className="pb-2">Scope</th>
                  <th className="pb-2">Uses</th>
                  <th className="pb-2">Expires</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-line/40 divide-y">
                {invites.map((i) => {
                  const exhausted = i.redeemed_count >= i.max_uses;
                  return (
                    <tr key={i.id} className={exhausted ? "text-muted" : ""}>
                      <td className="py-2 pr-4 font-mono text-xs tracking-wider">{i.code}</td>
                      <td className="py-2 pr-4 capitalize">{i.kind}</td>
                      <td className="py-2 pr-4">
                        {i.kind === "student" && (i.cohort_name ?? "—")}
                        {i.kind === "faculty" &&
                          `${i.cohort_name ?? "—"} · ${i.college_role ?? "—"}`}
                        {i.kind === "staff" && (i.staff_role ?? "—")}
                      </td>
                      <td className="py-2 pr-4">
                        {i.redeemed_count} / {i.max_uses}
                      </td>
                      <td className="py-2 pr-4">
                        {i.expires_at ? new Date(i.expires_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2">
                        <InviteRowActions id={i.id} code={i.code} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
