import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { listFacultyHandbook, type HandbookModule } from "@/lib/queries/handbook";
import { HandbookProgress } from "./HandbookProgress";

const STATUS_TONE: Record<NonNullable<HandbookModule["status"]>, "default" | "warn" | "ok"> = {
  not_started: "default",
  in_progress: "warn",
  completed: "ok",
};

export default async function FacultyHandbookPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("schedule.read");
  const tab = ((await searchParams).tab ?? "non_technical") as "technical" | "non_technical";
  const modules = await listFacultyHandbook();

  const filtered = modules.filter((m) => m.category === tab);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Faculty handbook</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Operating playbook</h1>
        <CardSub className="mt-1">
          {modules.filter((m) => m.status === "completed").length} of {modules.length} modules complete
        </CardSub>
      </header>

      <nav className="flex gap-1 border-b border-line/50">
        <TabLink current={tab} value="non_technical" label="Non-technical" />
        <TabLink current={tab} value="technical" label="Technical" />
      </nav>

      {filtered.length === 0 ? (
        <Card>
          <CardSub>
            No {tab === "technical" ? "technical" : "non-technical"} modules published yet.
          </CardSub>
        </Card>
      ) : (
        filtered.map((m) => (
          <section key={m.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <CardTitle>
                <span className="text-muted mr-2 font-mono text-xs">
                  {String(m.ordinal).padStart(2, "0")}
                </span>
                {m.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {m.status && <Badge variant={STATUS_TONE[m.status]}>{m.status.replace("_", " ")}</Badge>}
                <HandbookProgress moduleId={m.id} status={m.status} />
              </div>
            </div>
            <Card className="p-6">
              {m.body_md ? (
                <MarkdownView source={m.body_md} />
              ) : (
                <CardSub>Module content pending.</CardSub>
              )}
            </Card>
          </section>
        ))
      )}
    </div>
  );
}

function TabLink({ current, value, label }: { current: string; value: string; label: string }) {
  const active = current === value;
  return (
    <a
      href={`?tab=${value}`}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
    </a>
  );
}
