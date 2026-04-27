import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkCapability, requireCapability } from "@/lib/auth/requireCapability";
import { listBoardPosts } from "@/lib/queries/board";
import { listModBoardPosts } from "@/lib/queries/board-mod";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { relTime } from "@/lib/format";
import { BoardLiveRefresh } from "./BoardLive";
import { ModBoardClient } from "@/app/(authed)/admin/board/ModBoardClient";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; mod?: string }>;
}) {
  const cohort = await getMyCurrentCohort();
  if (!cohort)
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
      </Card>
    );
  await requireCapability("board.read", cohort.id);

  const sp = await searchParams;
  const filter = sp.filter ?? "all";
  const canModerate = await checkCapability("moderation.write", cohort.id);
  const inModView = canModerate && sp.mod === "1";

  if (inModView) {
    const modPosts = await listModBoardPosts(cohort.id);
    return (
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-accent font-mono text-xs tracking-widest uppercase">
              Q&amp;A Board · moderation
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Discussion
            </h1>
            <CardSub className="mt-1">
              {modPosts.length} posts ·{" "}
              {modPosts.filter((p) => p.pinned_at).length} pinned ·{" "}
              {modPosts.filter((p) => p.deleted_at).length} hidden
            </CardSub>
          </div>
          <Button variant="outline" asChild>
            <Link href="/board">Exit moderation</Link>
          </Button>
        </header>
        <ModBoardClient posts={modPosts} />
      </div>
    );
  }

  const all = await listBoardPosts(cohort.id);
  const posts = filter === "faq" ? all.filter((p) => p.is_canonical) : all;
  return (
    <div className="space-y-6">
      <BoardLiveRefresh cohortId={cohort.id} />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Q&amp;A Board
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Discussion
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/board"
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === "all" ? "bg-accent text-bg" : "text-muted hover:text-ink"
            }`}
          >
            All
          </Link>
          <Link
            href="/board?filter=faq"
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === "faq" ? "bg-accent text-bg" : "text-muted hover:text-ink"
            }`}
          >
            FAQ
          </Link>
          {canModerate && (
            <Button variant="outline" asChild>
              <Link href="/board?mod=1">Moderate</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/board/new">New post</Link>
          </Button>
        </div>
      </header>
      {posts.length === 0 ? (
        <Card>
          <CardTitle>
            {filter === "faq" ? "No FAQ posts yet" : "No posts yet"}
          </CardTitle>
          <CardSub className="mt-2">
            {filter === "faq"
              ? "Faculty mark useful threads as FAQ."
              : "Be the first to ask a question."}
          </CardSub>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card
              key={p.id}
              className="hover:border-accent/40 transition-colors"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/board/${p.id}`} className="hover:text-accent">
                  <CardTitle>{p.title}</CardTitle>
                </Link>
                <div className="flex items-center gap-1.5">
                  {p.is_canonical && <Badge variant="ok">FAQ</Badge>}
                  {p.pinned_at && <Badge variant="accent">Pinned</Badge>}
                </div>
              </div>
              <p className="text-ink/85 mt-2 text-sm">
                {p.body_md.slice(0, 200)}
                {p.body_md.length > 200 ? "…" : ""}
              </p>
              <div className="text-muted mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span>{p.author_name ?? "Member"}</span>
                <span>·</span>
                <span>{relTime(p.created_at)}</span>
                <span>·</span>
                <span>
                  {p.reply_count} {p.reply_count === 1 ? "reply" : "replies"}
                </span>
                {p.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
