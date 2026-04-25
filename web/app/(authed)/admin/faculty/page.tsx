import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listFaculty } from "@/lib/queries/admin";

export default async function AdminFacultyPage() {
  await requireCapability("faculty.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const faculty = await listFaculty(cohort.id);

  const support = faculty.filter((f) => f.college_role === "support");
  const exec = faculty.filter((f) => f.college_role === "executive");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Faculty</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <p className="text-muted mt-1 text-sm">
          {support.length} support · {exec.length} executive
        </p>
      </header>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Support faculty</h2>
          <Badge>pod-scoped grading + attendance</Badge>
        </div>
        {support.length === 0 ? (
          <Card><p className="text-muted text-sm">None assigned.</p></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {support.map((f) => (
              <Card key={f.user_id} className="p-4">
                <StudentRow fullName={f.full_name} email={f.email} hint="Support" />
              </Card>
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Executive faculty</h2>
          <Badge>read-only analytics + announcements</Badge>
        </div>
        {exec.length === 0 ? (
          <Card><p className="text-muted text-sm">None assigned.</p></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exec.map((f) => (
              <Card key={f.user_id} className="p-4">
                <StudentRow fullName={f.full_name} email={f.email} hint="Executive" />
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
