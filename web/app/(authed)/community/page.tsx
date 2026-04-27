import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkCapability, requireCapability } from "@/lib/auth/requireCapability";
import { listCommunityPosts } from "@/lib/queries/community";
import { listModCommunityPosts } from "@/lib/queries/community-mod";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { CommunityLiveRefresh } from "./CommunityLive";
import { CommunityList } from "./CommunityList";
import { ModCommunityClient } from "@/app/(authed)/admin/community/ModCommunityClient";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ mod?: string }>;
}) {
  const cohort = await getMyCurrentCohort();
  if (!cohort)
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
      </Card>
    );
  await requireCapability("community.read", cohort.id);

  const sp = await searchParams;
  const canModerate = await checkCapability("moderation.write", cohort.id);
  const inModView = canModerate && sp.mod === "1";

  if (inModView) {
    const modPosts = await listModCommunityPosts(cohort.id);
    return (
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-accent font-mono text-xs tracking-widest uppercase">
              Community · moderation
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Community
            </h1>
            <CardSub className="mt-1">
              {modPosts.length} posts ·{" "}
              {modPosts.filter((p) => p.pinned_at).length} pinned ·{" "}
              {modPosts.filter((p) => p.deleted_at).length} hidden
            </CardSub>
          </div>
          <Button variant="outline" asChild>
            <Link href="/community">Exit moderation</Link>
          </Button>
        </header>
        <ModCommunityClient posts={modPosts} />
      </div>
    );
  }

  const all = await listCommunityPosts(cohort.id);
  return (
    <div className="space-y-6">
      <CommunityLiveRefresh cohortId={cohort.id} />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Community
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Community</h1>
        </div>
        <div className="flex items-center gap-2">
          {canModerate && (
            <Button variant="outline" asChild>
              <Link href="/community?mod=1">Moderate</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/community/new">New post</Link>
          </Button>
        </div>
      </header>
      <CommunityList posts={all} />
    </div>
  );
}
