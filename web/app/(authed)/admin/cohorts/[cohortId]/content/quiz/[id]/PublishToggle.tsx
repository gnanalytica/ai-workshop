"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setQuizPublished } from "@/lib/actions/content";

export function PublishToggle({
  cohortId,
  quizId,
  initial,
  questionCount,
}: {
  cohortId: string;
  quizId: string;
  initial: boolean;
  questionCount: number;
}) {
  const [published, setPublished] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  function flip() {
    const next = !published;
    if (next && questionCount === 0) {
      toast.error("Add at least one question before publishing.");
      return;
    }
    start(async () => {
      const r = await setQuizPublished({
        cohort_id: cohortId,
        quiz_id: quizId,
        is_published: next,
      });
      if (r.ok) {
        setPublished(next);
        toast.success(next ? "Quiz is now visible to students." : "Quiz is hidden from students.");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant={published ? "ok" : "warn"}>
        {published ? "Published" : "Draft"}
      </Badge>
      <p className="text-muted text-xs">
        {published
          ? "Students on the matching day will see this quiz."
          : "Hidden — students will not see this quiz yet."}
      </p>
      <Button
        size="sm"
        variant={published ? "outline" : "default"}
        onClick={flip}
        disabled={pending}
        className="ml-auto"
      >
        {pending
          ? "Saving…"
          : published
            ? "Hide from students"
            : "Publish to students"}
      </Button>
    </div>
  );
}
