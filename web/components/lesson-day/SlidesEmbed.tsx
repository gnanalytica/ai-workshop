import { Card, CardSub, CardTitle } from "@/components/ui/card";

function toEmbedUrl(raw: string): string {
  try {
    const u = new URL(raw);
    // Google Slides: /presentation/d/<id>/edit  →  /presentation/d/<id>/embed
    if (u.hostname.includes("docs.google.com") && u.pathname.includes("/presentation/")) {
      const tail = u.pathname.replace(/\/(edit|preview|view|pub)$/i, "");
      return `https://docs.google.com/${tail.replace(/^\//, "")}/embed?start=false&loop=false`;
    }
    // Figma (file / design / proto / slides / board): wrap in the embed host.
    if (u.hostname === "figma.com" || u.hostname.endsWith(".figma.com")) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`;
    }
    return raw;
  } catch {
    return raw;
  }
}

export function SlidesEmbed({
  url,
  unlocked,
}: {
  url: string | null;
  unlocked: boolean;
}) {
  if (!url) return null;

  if (!unlocked) {
    return (
      <Card className="p-5">
        <CardTitle>🔒 Slides locked</CardTitle>
        <CardSub>The slide deck for this day will appear here once it&rsquo;s unlocked.</CardSub>
      </Card>
    );
  }

  const src = toEmbedUrl(url);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-3">
        <CardTitle className="text-base">Slides</CardTitle>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent text-xs underline-offset-2 hover:underline"
        >
          Open in new tab ↗
        </a>
      </div>
      <div className="relative aspect-video w-full bg-bg-soft">
        <iframe
          src={src}
          title="Day slides"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </Card>
  );
}
