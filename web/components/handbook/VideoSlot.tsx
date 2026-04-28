import { Card } from "@/components/ui/card";
import { VideoLazy } from "./VideoLazy";

interface VideoSlotProps {
  url?: string | null;
  caption?: string | null;
  thumbnailUrl?: string | null;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

function youtubeEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!YOUTUBE_HOSTS.has(u.hostname)) return null;
    let videoId: string | null = null;
    if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
      videoId = u.pathname.replace(/^\//, "").split("/")[0] || null;
    } else if (u.pathname === "/watch") {
      videoId = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/embed/")) {
      videoId = u.pathname.split("/")[2] ?? null;
    } else if (u.pathname.startsWith("/shorts/")) {
      videoId = u.pathname.split("/")[2] ?? null;
    }
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

/**
 * Optional video micro-tutorial slot for handbook modules.
 * Renders nothing when `url` is null/empty so empty slots stay invisible.
 */
export function VideoSlot({ url, caption, thumbnailUrl }: VideoSlotProps) {
  if (!url) return null;

  const embed = youtubeEmbedUrl(url);

  return (
    <figure className="mb-5">
      <Card className="overflow-hidden p-0">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          {embed ? (
            <iframe
              src={embed}
              title={caption ?? "Handbook video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0">
              <VideoLazy url={url} thumbnailUrl={thumbnailUrl} />
            </div>
          )}
        </div>
      </Card>
      {caption ? (
        <figcaption className="text-muted mt-2 text-xs">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
