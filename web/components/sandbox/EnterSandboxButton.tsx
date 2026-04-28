"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enterSandbox } from "@/lib/actions/sandbox";
import { toast } from "sonner";

/**
 * Sandbox launcher. Pair with StartGuideButton in handbooks: "Open the
 * sandbox" button puts the user into the demo cohort, then they hit
 * "Start interactive guide" to walk through it.
 */
export function EnterSandboxButton({
  variant = "outline",
  label = "Open sandbox cohort",
}: {
  variant?: "default" | "outline" | "ghost";
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await enterSandbox();
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          toast.success("Sandbox active — explore freely.");
          router.refresh();
        })
      }
    >
      {pending ? "Opening…" : label}
    </Button>
  );
}
