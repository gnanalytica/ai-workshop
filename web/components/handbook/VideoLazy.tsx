"use client";

import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => <div className="bg-bg-soft/50 h-full w-full" aria-hidden />,
});

export function VideoLazy({
  url,
  thumbnailUrl,
}: {
  url: string;
  thumbnailUrl?: string | null;
}) {
  return <VideoPlayer url={url} thumbnailUrl={thumbnailUrl} />;
}
