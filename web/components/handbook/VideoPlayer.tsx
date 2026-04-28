"use client";

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string | null;
}

export default function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  return (
    <video
      controls
      preload="metadata"
      poster={thumbnailUrl ?? undefined}
      className="h-full w-full"
    >
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
}
