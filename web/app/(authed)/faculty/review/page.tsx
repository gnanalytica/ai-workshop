import { requireCapability } from "@/lib/auth/requireCapability";
import { getSession } from "@/lib/auth/session";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort, listPendingSubmissions } from "@/lib/queries/faculty";
import { ReviewQueueClient } from "./ReviewQueueClient";

export default async function FacultyReviewPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireCapability("grading.read");
  const me = await getSession();
  const f = await getFacultyCohort();
  if (!f || !me) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const subs = await listPendingSubmissions(f.cohort.id, me.id);
  const { id } = await props.searchParams;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · review
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Review queue</h1>
        <CardSub className="mt-1 flex items-center gap-2">
          Read-only follow-up on AI/trainer grading decisions.
          <Badge variant="accent">Pod-scoped</Badge>
        </CardSub>
      </header>

      {subs.length === 0 ? (
        <Card><CardSub>Nothing pending in your pod.</CardSub></Card>
      ) : (
        <ReviewQueueClient submissions={subs} initialId={id ?? null} />
      )}
    </div>
  );
}
