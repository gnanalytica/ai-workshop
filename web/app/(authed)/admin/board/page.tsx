import { requireCapability } from "@/lib/auth/requireCapability";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getAdminCohort } from "@/lib/queries/admin-context";
import { listModBoardPosts } from "@/lib/queries/board-mod";
import { ModBoardClient } from "./ModBoardClient";

export default async function AdminBoardPage() {
  await requireCapability("moderation.write");
  const cohort = await getAdminCohort();
  if (!cohort) return <Card><CardTitle>No cohort</CardTitle></Card>;
  const posts = await listModBoardPosts(cohort.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Board moderation</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{cohort.name}</h1>
        <CardSub className="mt-1">
          {posts.length} posts · {posts.filter((p) => p.pinned_at).length} pinned ·{" "}
          {posts.filter((p) => p.deleted_at).length} hidden
        </CardSub>
      </header>
      <ModBoardClient posts={posts} />
    </div>
  );
}
