import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBoardPosts } from "@/lib/queries/board";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { relTime } from "@/lib/format";
import { BoardLiveRefresh } from "./BoardLive";

export default async function BoardPage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) return <Card><CardTitle>No active cohort</CardTitle></Card>;
  const posts = await listBoardPosts(cohort.id);
  return (
    <div className="space-y-6">
      <BoardLiveRefresh cohortId={cohort.id} />
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase">Q&amp;A Board</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Discussion</h1>
        </div>
        <Button asChild>
          <Link href="/board/new">New post</Link>
        </Button>
      </header>
      {posts.length === 0 ? (
        <Card>
          <CardTitle>No posts yet</CardTitle>
          <CardSub className="mt-2">Be the first to ask a question.</CardSub>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="hover:border-accent/40 transition-colors">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/board/${p.id}`} className="hover:text-accent">
                  <CardTitle>{p.title}</CardTitle>
                </Link>
                {p.pinned_at && <Badge variant="accent">Pinned</Badge>}
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
                <span>{p.reply_count} {p.reply_count === 1 ? "reply" : "replies"}</span>
                {p.tags.map((t) => (<Badge key={t}>{t}</Badge>))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
