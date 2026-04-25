import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { listFacultyHandbook } from "@/lib/queries/handbook";

const STATUS_TONE: Record<NonNullable<Awaited<ReturnType<typeof listFacultyHandbook>>[number]["status"]>, "default" | "warn" | "ok"> = {
  not_started: "default",
  in_progress: "warn",
  completed: "ok",
};

export default async function FacultyHandbookPage() {
  await requireCapability("schedule.read");
  const modules = await listFacultyHandbook();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Faculty handbook</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Operating playbook</h1>
        <CardSub className="mt-1">
          {modules.filter((m) => m.status === "completed").length} of {modules.length} modules complete
        </CardSub>
      </header>

      {modules.length === 0 ? (
        <Card><CardSub>No modules published yet.</CardSub></Card>
      ) : (
        modules.map((m) => (
          <section key={m.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <CardTitle>
                <span className="text-muted mr-2 font-mono text-xs">
                  {String(m.ordinal).padStart(2, "0")}
                </span>
                {m.title}
              </CardTitle>
              {m.status && <Badge variant={STATUS_TONE[m.status]}>{m.status.replace("_", " ")}</Badge>}
            </div>
            <Card className="p-6">
              {m.body_md ? (
                <MarkdownView source={m.body_md} />
              ) : (
                <CardSub>
                  Module content pending. (Trainers can edit via SQL or the admin/content surface.)
                </CardSub>
              )}
            </Card>
          </section>
        ))
      )}
    </div>
  );
}
