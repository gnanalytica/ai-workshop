"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "@/components/student-row/StudentRow";
import { cn } from "@/lib/utils";
import { exportCsv } from "@/lib/format/csv";
import { fmtDate } from "@/lib/format";
import { RosterTable } from "@/app/(authed)/admin/roster/RosterTable";
import type { RosterRow, FacultyRow } from "@/lib/queries/admin";
import type { TeamRow } from "@/lib/queries/teams";

type Tab = "students" | "faculty" | "teams";

const TABS: { id: Tab; label: string }[] = [
  { id: "students", label: "Students" },
  { id: "faculty", label: "Faculty" },
  { id: "teams", label: "Teams" },
];

export function RosterTabs({
  students,
  faculty,
  teams,
  cohortId,
  cohortSlug,
  initialTab,
}: {
  students: RosterRow[];
  faculty: FacultyRow[];
  teams: TeamRow[];
  cohortId: string;
  cohortSlug: string;
  initialTab: Tab;
}) {
  const active: Tab = TABS.some((t) => t.id === initialTab) ? initialTab : "students";

  const today = new Date().toISOString().slice(0, 10);

  function downloadStudents() {
    exportCsv(`${cohortSlug}-students-${today}.csv`, students, [
      { header: "Full name", value: (r) => r.full_name ?? "" },
      { header: "Email", value: (r) => r.email },
      { header: "College", value: (r) => r.college ?? "" },
      { header: "Status", value: (r) => r.status },
      { header: "Source", value: (r) => r.source ?? "" },
      { header: "Pod", value: (r) => r.pod_name ?? "" },
      { header: "Registered at", value: (r) => fmtDate(r.created_at) },
    ]);
  }

  function downloadFaculty() {
    exportCsv(`${cohortSlug}-faculty-${today}.csv`, faculty, [
      { header: "Full name", value: (r) => r.full_name ?? "" },
      { header: "Email", value: (r) => r.email },
      { header: "Pods", value: (r) => r.pods },
    ]);
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <Link
              key={t.id}
              href={`?tab=${t.id}`}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border-accent/40"
                  : "border-line text-muted hover:text-ink hover:border-accent/30",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {active === "students" && (
        <div className="space-y-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-muted text-sm">
              {students.length} total ·{" "}
              {students.filter((r) => r.status === "confirmed").length} confirmed ·{" "}
              {students.filter((r) => r.status === "pending").length} pending
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ok">Confirmed</Badge>
              <Badge variant="warn">Pending</Badge>
              <Badge>Waitlist</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadStudents}
                disabled={students.length === 0}
                title={
                  students.length === 0
                    ? "No students to export"
                    : `Export all ${students.length} student${students.length === 1 ? "" : "s"} to CSV (opens in Excel)`
                }
              >
                <Download size={14} strokeWidth={2.1} className="mr-1.5" />
                Export CSV
              </Button>
            </div>
          </header>
          <RosterTable rows={students} cohortId={cohortId} />
        </div>
      )}

      {active === "faculty" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Faculty</h2>
              <Badge>pod-scoped grading + moderation</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadFaculty}
              disabled={faculty.length === 0}
              title={
                faculty.length === 0
                  ? "No faculty to export"
                  : `Export all ${faculty.length} faculty to CSV (opens in Excel)`
              }
            >
              <Download size={14} strokeWidth={2.1} className="mr-1.5" />
              Export CSV
            </Button>
          </div>
          <p className="text-muted text-sm">{faculty.length} assigned</p>
          {faculty.length === 0 ? (
            <Card>
              <p className="text-muted text-sm">None assigned yet.</p>
            </Card>
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
      )}

      {active === "teams" && (
        <section className="space-y-4">
          <CardSub>
            {teams.length} teams ·{" "}
            {teams.reduce((s, t) => s + t.member_count, 0)} memberships
          </CardSub>
          {teams.length === 0 ? (
            <Card>
              <CardTitle>No teams yet</CardTitle>
              <CardSub className="mt-2">
                Students form their own teams from /teams.
              </CardSub>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => (
                <Card key={t.id} className="p-5">
                  <div className="flex items-baseline justify-between">
                    <CardTitle>{t.name}</CardTitle>
                    <Badge>
                      {t.member_count}{" "}
                      {t.member_count === 1 ? "member" : "members"}
                    </Badge>
                  </div>
                  <ul className="text-muted mt-3 space-y-1 text-sm">
                    {t.members.map((m) => (
                      <li key={m.user_id}>{m.full_name ?? "—"}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
