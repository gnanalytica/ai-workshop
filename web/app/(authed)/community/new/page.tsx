import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/auth/requireCapability";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listCohortRoster } from "@/lib/queries/cohort-roster-mini";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card>No active cohort</Card>;
  await requireCapability("community.read", cohort.id);
  await requireCapability("community.write", cohort.id);
  const roster = await listCohortRoster(cohort.id);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">New post</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ask the cohort</h1>
        <p className="text-muted mt-1 text-sm">
          Markdown supported. Type <code>@</code> to mention students or faculty.
        </p>
      </header>
      <NewPostForm cohortId={cohort.id} roster={roster} />
    </div>
  );
}
