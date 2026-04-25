import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { fmtDateTime, relTime } from "@/lib/format";

interface TimelineItem { id: string; kind: "submission" | "lab" | "attendance"; label: string; detail: string; at: string }

async function listTimeline(cohortId: string): Promise<TimelineItem[]> {
  const sb = await getSupabaseServer();
  const [subs, labs, atts] = await Promise.all([
    sb.from("submissions").select("id, status, updated_at, assignments!inner(title, day_number, cohort_id)").eq("assignments.cohort_id", cohortId).order("updated_at", { ascending: false }).limit(20),
    sb.from("lab_progress").select("user_id, day_number, lab_id, status, updated_at").eq("cohort_id", cohortId).order("updated_at", { ascending: false }).limit(20),
    sb.from("attendance").select("cohort_id, day_number, status, marked_at").eq("cohort_id", cohortId).order("marked_at", { ascending: false }).limit(20),
  ]);
  const items: TimelineItem[] = [];
  for (const r of (subs.data ?? []) as Array<{ id: string; status: string; updated_at: string; assignments: { title: string; day_number: number } }>) {
    items.push({ id: `sub-${r.id}`, kind: "submission", label: r.status === "graded" ? "Submission graded" : "Submission updated", detail: `Day ${r.assignments.day_number} · ${r.assignments.title}`, at: r.updated_at });
  }
  for (const r of (labs.data ?? []) as Array<{ user_id: string; day_number: number; lab_id: string; status: string; updated_at: string }>) {
    items.push({ id: `lab-${r.user_id}-${r.day_number}-${r.lab_id}`, kind: "lab", label: r.status === "done" ? "Lab completed" : "Lab progress", detail: `Day ${r.day_number} · ${r.lab_id}`, at: r.updated_at });
  }
  for (const r of (atts.data ?? []) as Array<{ cohort_id: string; day_number: number; status: string; marked_at: string }>) {
    items.push({ id: `att-${r.day_number}-${r.marked_at}`, kind: "attendance", label: `Attendance · ${r.status}`, detail: `Day ${r.day_number}`, at: r.marked_at });
  }
  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return items;
}

export default async function TimelinePage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const items = await listTimeline(cohort.id);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Your timeline</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Recent activity</h1>
      </header>
      {items.length === 0 ? (
        <Card><CardSub>Nothing yet — once you submit work or attend live sessions, events show here.</CardSub></Card>
      ) : (
        <ol className="border-line space-y-3 border-l-2 pl-5">
          {items.map((it) => (
            <li key={it.id} className="relative">
              <span className="bg-accent absolute -left-[27px] top-2 h-2 w-2 rounded-full" />
              <Card className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="text-sm">{it.label}</CardTitle>
                  <Badge>{relTime(it.at)}</Badge>
                </div>
                <p className="text-muted mt-1 text-xs">{it.detail} · {fmtDateTime(it.at)}</p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
