"use client";

import { Button } from "@/components/ui/button";
import { TOUR_EVENT } from "./Tour";
import type { Persona } from "@/lib/auth/persona";

/**
 * Re-launches the role-specific tour overlay. Pairs with <TourMount> in
 * AppShell, which listens for the custom event. Use this on handbook pages
 * or anywhere a "show me around" affordance is wanted.
 */
export function StartGuideButton({
  persona,
  variant = "default",
  size = "md",
  label = "Start interactive guide",
}: {
  persona?: Persona | null;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(TOUR_EVENT, {
            detail: persona ? { persona } : {},
          }),
        );
      }}
    >
      {label}
    </Button>
  );
}
