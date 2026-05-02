"use client";

import { GoogleButton } from "./GoogleButton";

export function StartForm({ next, initialError }: { next: string; initialError?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={next} />
      {initialError ? <p className="text-danger mt-1 text-sm">{initialError}</p> : null}
    </div>
  );
}
