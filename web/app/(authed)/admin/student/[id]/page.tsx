import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { getStudentDetail } from "@/lib/queries/student-detail";
import { fmtDate } from "@/lib/format";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireCapability("roster.read");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const student = await getStudentDetail(cohort.id, id);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Student</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {student.full_name ?? student.email}
        </h1>
        <p className="text-muted mt-1 text-sm">
          {student.email} · {student.college ?? "—"} · {student.pod_name ?? "no pod"}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Attendance</h2>
        <Card>
          {student.attendance.length === 0 ? (
            <CardSub>No attendance recorded.</CardSub>
          ) : (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {student.attendance.map((a) => (
                <span
                  key={a.day_number}
                  className="border-line bg-bg-soft rounded border px-2 py-0.5 font-mono"
                  title={a.status}
                >
                  D{String(a.day_number).padStart(2, "0")}: {a.status[0]?.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Labs</h2>
        <Card>
          <p className="text-muted text-sm">
            {student.labs.filter((l) => l.status === "done").length} done /{" "}
            {student.labs.length} attempted
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Submissions ({student.submissions.length})
        </h2>
        {student.submissions.length === 0 ? (
          <Card><CardSub>None yet.</CardSub></Card>
        ) : (
          <div className="space-y-3">
            {student.submissions.map((s) => (
              <Card key={s.id} className="space-y-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-ink text-sm font-medium">
                    Day {s.day_number} · {s.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "graded" ? "ok" : s.status === "submitted" ? "warn" : "default"}>
                      {s.status}
                    </Badge>
                    {s.score !== null && <Badge variant="accent">{s.score}</Badge>}
                    <span className="text-muted text-xs">{fmtDate(s.updated_at)}</span>
                  </div>
                </div>
                {s.body && (
                  <p className="bg-bg-soft border-line text-ink/85 max-h-40 overflow-y-auto rounded-md border p-3 text-xs whitespace-pre-line">
                    {s.body}
                  </p>
                )}
                {s.feedback_md && (
                  <p className="border-accent/40 bg-accent/5 text-ink/85 rounded-md border p-3 text-xs whitespace-pre-line">
                    <span className="text-accent font-mono text-[10px] uppercase">Feedback · </span>
                    {s.feedback_md}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="p-4">
        <StudentRow
          fullName={student.full_name}
          email={student.email}
          pod={student.pod_name}
          hint="Quick contact"
        />
      </Card>
    </div>
  );
}
