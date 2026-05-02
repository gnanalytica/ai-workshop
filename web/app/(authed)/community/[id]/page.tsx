import { notFound } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownView } from "@/components/markdown/MarkdownView";
import { getCommunityPost } from "@/lib/queries/community-detail";
import { fmtDateTime, relTime } from "@/lib/format";
import { getSession } from "@/lib/auth/session";
import { checkCapability } from "@/lib/auth/requireCapability";
import { listCohortRoster } from "@/lib/queries/cohort-roster-mini";
import { ReplyForm } from "./ReplyForm";
import { ReplyActions, PostModeration } from "./ReplyActions";
import { CommunityVoteControls } from "../CommunityVoteControls";

export default async function BoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) notFound();
  const user = await getSession();
  const canModerate = await checkCapability("moderation.write");
  const canWriteCommunity = await checkCapability("community.write", post.cohort_id);
  const isAuthor = !!user && user.id === post.author_id;
  const roster = await listCohortRoster(post.cohort_id);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex flex-wrap items-start gap-3">
          <CommunityVoteControls
            cohortId={post.cohort_id}
            postId={post.id}
            score={post.post_vote_score}
            myVote={post.my_post_vote}
            canVote={canWriteCommunity}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">{post.title}</h1>
              <div className="flex items-center gap-2">
                {post.is_canonical && <Badge variant="ok">FAQ</Badge>}
                {post.pinned_at && <Badge variant="accent">Pinned</Badge>}
                <PostModeration
                  postId={post.id}
                  pinned={!!post.pinned_at}
                  isCanonical={post.is_canonical}
                  canModerate={canModerate}
                />
              </div>
            </div>
          </div>
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

      <Card className="p-4 sm:p-6">
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
            <Card key={r.id} className={`p-4 ${r.is_accepted ? "border-ok/40" : ""}`}>
              <div className="flex gap-3">
                <CommunityVoteControls
                  cohortId={post.cohort_id}
                  postId={post.id}
                  replyId={r.id}
                  score={r.vote_score}
                  myVote={r.my_vote}
                  canVote={canWriteCommunity}
                  compact
                />
                <div className="min-w-0 flex-1">
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
              <div className="mt-3">
                <ReplyActions
                  replyId={r.id}
                  postId={post.id}
                  isAccepted={r.is_accepted}
                  canAccept={isAuthor}
                  canModerate={canModerate}
                />
              </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      {canWriteCommunity ? (
        <ReplyForm postId={post.id} roster={roster} />
      ) : (
        <p className="text-muted text-sm">You can read this thread; posting requires community access for this cohort.</p>
      )}
    </article>
  );
}
