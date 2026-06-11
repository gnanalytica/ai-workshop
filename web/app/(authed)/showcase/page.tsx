import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listTeamGallery, type GalleryTeam } from "@/lib/queries/teams";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const cohort = await getMyCurrentCohort();
  if (!cohort) {
    return (
      <Card>
        <CardTitle>No active cohort</CardTitle>
        <CardSub className="mt-2">The team showcase appears once a cohort is live.</CardSub>
      </Card>
    );
  }

  const teams = await listTeamGallery(cohort.id);
  const shipped = teams.filter((t) => t.submission?.status === "submitted").length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Showcase</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Capstone teams</h1>
        <CardSub className="mt-1">
          {teams.length} teams · {shipped} submitted
        </CardSub>
      </header>

      {teams.length === 0 ? (
        <Card>
          <CardTitle>No teams yet</CardTitle>
          <CardSub className="mt-2">
            Teams appear here once faculty import the finalized group list.
          </CardSub>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Rewrite common share links into their embeddable form so they render
 * inline in an <iframe>. Falls back to the raw URL for anything unknown.
 */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "docs.google.com") {
      const m = u.pathname.match(/\/presentation\/d\/([^/]+)/);
      if (m) return `https://docs.google.com/presentation/d/${m[1]}/embed`;
    }
    if (host === "drive.google.com") {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
    if (host === "canva.com" && u.pathname.includes("/view")) {
      u.searchParams.set("embed", "");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function TeamCard({ team }: { team: GalleryTeam }) {
  const s = team.submission;
  const submitted = s?.status === "submitted";
  const links: { label: string; url: string | null }[] = [
    { label: "Live", url: s?.product_url ?? null },
    { label: "Slides", url: s?.presentation_url ?? null },
    { label: "Repo", url: s?.repo_url ?? null },
    { label: "Video", url: s?.demo_video_url ?? null },
  ];

  // Card media: show the presentation deck inline; fall back to the live site.
  const embed = s?.presentation_url
    ? { src: toEmbedUrl(s.presentation_url), label: "Presentation" }
    : s?.product_url
      ? { src: s.product_url, label: "Live site" }
      : null;

  return (
    <Card className="flex flex-col overflow-hidden">
      {embed ? (
        <div className="border-line/60 bg-bg-soft aspect-video w-full border-b">
          <iframe
            src={embed.src}
            title={`${s?.title ?? team.name} — ${embed.label}`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer"
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="border-line/60 bg-bg-soft text-muted flex aspect-video w-full items-center justify-center border-b text-xs">
          No presentation yet
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="break-words text-base">
            {s?.title || team.name}
          </CardTitle>
          <Badge variant={submitted ? "ok" : "default"}>{submitted ? "Submitted" : "In progress"}</Badge>
        </div>

        <p className="text-muted text-xs">
          {team.team_number != null ? `Team ${team.team_number} · ` : ""}
          {team.name}
        </p>

        {s?.pitch && <p className="text-ink/85 text-sm break-words">{s.pitch}</p>}

        <p className="text-muted mt-auto text-xs">
          {team.member_names.slice(0, 5).join(", ")}
        </p>

        <div className="flex flex-wrap gap-2 pt-1 text-sm">
          {links
            .filter((l) => l.url)
            .map((l) => (
              <Link
                key={l.label}
                href={l.url!}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {l.label} →
              </Link>
            ))}
        </div>
      </div>
    </Card>
  );
}
