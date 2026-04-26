import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFacultyCohort, listPendingSubmissions } from "@/lib/queries/faculty";
import { ReviewQueueClient } from "./ReviewQueueClient";

export default async function FacultyReviewPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireCapability("grading.read");
  const f = await getFacultyCohort();
  if (!f) return <Card><CardTitle>You aren&apos;t assigned to a cohort.</CardTitle></Card>;
  const subs = await listPendingSubmissions(f.cohort.id);
  const { id } = await props.searchParams;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          {f.cohort.name} · grading
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Review queue</h1>
        <CardSub className="mt-1 flex items-center gap-2">
          {subs.length} submissions awaiting review
          <Badge variant="accent">Pod-scoped</Badge>
        </CardSub>
      </header>

      {subs.length === 0 ? (
        <Card><CardSub>Inbox zero.</CardSub></Card>
      ) : (
        <ReviewQueueClient
          submissions={subs}
          initialId={id ?? null}
          canGrade={true}
        />
      )}
    </div>
  );
}
