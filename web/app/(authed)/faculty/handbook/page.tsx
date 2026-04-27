import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub } from "@/components/ui/card";
import { listFacultyHandbook } from "@/lib/queries/handbook";
import { HandbookView } from "./HandbookView";

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
        <HandbookView modules={filtered} />
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
