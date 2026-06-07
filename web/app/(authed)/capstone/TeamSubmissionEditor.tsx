"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { upsertTeamSubmission, setTeamSubmissionStatus } from "@/lib/actions/teams";
import type { TeamSubmission } from "@/lib/queries/teams";

export function TeamSubmissionEditor({
  teamId,
  cohortId,
  pitchedIdeas,
  initial,
  editable,
}: {
  teamId: string;
  cohortId: string;
  pitchedIdeas: string[];
  initial: TeamSubmission | null;
  editable: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [pitch, setPitch] = useState(initial?.pitch ?? "");
  const [chosenIdea, setChosenIdea] = useState(initial?.chosen_idea ?? "");
  const [presentation, setPresentation] = useState(initial?.presentation_url ?? "");
  const [product, setProduct] = useState(initial?.product_url ?? "");
  const [repo, setRepo] = useState(initial?.repo_url ?? "");
  const [demoVideo, setDemoVideo] = useState(initial?.demo_video_url ?? "");
  const [cover, setCover] = useState(initial?.cover_image_url ?? "");
  const [pending, start] = useTransition();

  const submitted = initial?.status === "submitted";

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setPitch(initial?.pitch ?? "");
    setChosenIdea(initial?.chosen_idea ?? "");
    setPresentation(initial?.presentation_url ?? "");
    setProduct(initial?.product_url ?? "");
    setRepo(initial?.repo_url ?? "");
    setDemoVideo(initial?.demo_video_url ?? "");
    setCover(initial?.cover_image_url ?? "");
  }, [initial]);

  function save(nextStatus?: "draft" | "submitted") {
    start(async () => {
      const r = await upsertTeamSubmission({
        team_id: teamId,
        cohort_id: cohortId,
        title: title.trim() || null,
        pitch: pitch.trim() || null,
        chosen_idea: chosenIdea.trim() || null,
        presentation_url: presentation.trim() || null,
        product_url: product.trim() || null,
        repo_url: repo.trim() || null,
        demo_video_url: demoVideo.trim() || null,
        cover_image_url: cover.trim() || null,
        ...(nextStatus ? { status: nextStatus } : {}),
      });
      if (r.ok) toast.success(nextStatus === "submitted" ? "Submitted 🎉" : "Saved");
      else toast.error(r.error);
    });
  }

  function toggleStatus() {
    start(async () => {
      const r = await setTeamSubmissionStatus({
        team_id: teamId,
        cohort_id: cohortId,
        status: submitted ? "draft" : "submitted",
      });
      if (r.ok) toast.success(submitted ? "Moved back to draft" : "Submitted 🎉");
      else toast.error(r.error);
    });
  }

  const disabled = pending || !editable;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardTitle>Deliverable</CardTitle>
        <Badge variant={submitted ? "ok" : "warn"}>{submitted ? "Submitted" : "Draft"}</Badge>
      </div>

      <div className="space-y-3">
        <Field label="Project title">
          <Input
            value={title}
            maxLength={140}
            disabled={disabled}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did your team build?"
          />
        </Field>

        <Field label="One-line pitch" hint="Shown on your showcase card.">
          <textarea
            rows={2}
            value={pitch}
            maxLength={280}
            disabled={disabled}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="The elevator pitch — what it does and who it's for."
            className="border-line bg-input-bg text-ink w-full rounded-md border p-3 text-sm disabled:opacity-60"
          />
        </Field>

        {pitchedIdeas.length > 0 && (
          <Field label="Which idea did you build?">
            <select
              value={chosenIdea}
              disabled={disabled}
              onChange={(e) => setChosenIdea(e.target.value)}
              className="border-line bg-input-bg text-ink w-full rounded-md border px-2 py-2 text-sm disabled:opacity-60"
            >
              <option value="">— select —</option>
              {pitchedIdeas.map((idea, i) => (
                <option key={i} value={idea}>{idea}</option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Presentation link" hint="Slides (Google Slides, PDF…).">
            <Input value={presentation} disabled={disabled} onChange={(e) => setPresentation(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Live website / app">
            <Input value={product} disabled={disabled} onChange={(e) => setProduct(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="GitHub repo" hint="Public GitHub URL only.">
            <Input value={repo} disabled={disabled} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/owner/repo" />
          </Field>
          <Field label="Demo video" hint="YouTube or Loom (optional).">
            <Input value={demoVideo} disabled={disabled} onChange={(e) => setDemoVideo(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Cover image URL" hint="Shown on your showcase card (optional).">
            <Input value={cover} disabled={disabled} onChange={(e) => setCover(e.target.value)} placeholder="https://…/cover.png" />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => save()} disabled={disabled}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
        {submitted ? (
          <Button variant="outline" onClick={toggleStatus} disabled={disabled}>
            Unsubmit
          </Button>
        ) : (
          <Button onClick={() => save("submitted")} disabled={disabled}>
            Submit final
          </Button>
        )}
      </div>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted text-xs tracking-wider uppercase">{label}</label>
      <div className="mt-1">{children}</div>
      {hint && <CardSub className="mt-1 text-xs">{hint}</CardSub>}
    </div>
  );
}
