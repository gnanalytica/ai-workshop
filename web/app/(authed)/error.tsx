"use client";

import { useEffect } from "react";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppShell error]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-lg py-12">
      <Card className="p-6 sm:p-8">
        <p className="text-danger font-mono text-xs tracking-widest uppercase">
          Something went wrong
        </p>
        <CardTitle className="mt-2 text-2xl">We hit an unexpected error.</CardTitle>
        <CardSub className="mt-2">
          Try again — if it keeps happening, ping a workshop admin and include
          this reference: <code className="text-ink">{error.digest ?? "—"}</code>
        </CardSub>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <a
            href="/dashboard"
            className="border-line text-ink rounded-md border px-4 py-2 text-sm font-medium"
          >
            Back to dashboard
          </a>
        </div>
      </Card>
    </main>
  );
}
