import { notFound } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { getBoardPost } from "@/lib/queries/board-detail";
import { fmtDateTime, relTime } from "@/lib/format";
import { ReplyForm } from "./ReplyForm";

export default async function BoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBoardPost(id);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          {post.pinned_at && <Badge variant="accent">Pinned</Badge>}
        </div>
        <p className="text-muted mt-2 text-xs">
          {post.author_name ?? "Member"} · {fmtDateTime(post.created_at)} · {relTime(post.created_at)}
        </p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex gap-2">
            {post.tags.map((t) => (<Badge key={t}>{t}</Badge>))}
          </div>
        )}
      </header>

      <Card className="p-6">
        <MarkdownView source={post.body_md} />
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
        </h2>
        {post.replies.length === 0 ? (
          <Card><CardSub>Be the first to reply.</CardSub></Card>
        ) : (
          post.replies.map((r) => (
            <Card key={r.id} className={r.is_accepted ? "border-emerald-500/40" : ""}>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-sm">{r.author_name ?? "Member"}</CardTitle>
                <div className="flex items-center gap-2">
                  {r.is_accepted && <Badge variant="ok">Accepted</Badge>}
                  <span className="text-muted text-xs">{relTime(r.created_at)}</span>
                </div>
              </div>
              <div className="mt-2">
                <MarkdownView source={r.body_md} />
              </div>
            </Card>
          ))
        )}
      </section>

      <ReplyForm postId={post.id} />
    </article>
  );
}
