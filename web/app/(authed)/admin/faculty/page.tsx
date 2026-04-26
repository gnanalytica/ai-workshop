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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Faculty</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <p className="text-muted mt-1 text-sm">
          {faculty.length} assigned
        </p>
      </header>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Faculty</h2>
          <Badge>pod-scoped grading + attendance + announcements</Badge>
        </div>
        {faculty.length === 0 ? (
          <Card><p className="text-muted text-sm">None assigned yet.</p></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f) => (
              <Card key={f.user_id} className="p-4">
                <StudentRow fullName={f.full_name} email={f.email} hint="Faculty" />
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
