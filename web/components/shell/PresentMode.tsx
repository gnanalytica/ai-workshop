"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { X } from "lucide-react";

/**
 * Adds `present-mode` class to <html> when ?present=1 is in the URL.
 * Globals CSS hides everything marked [data-shell-chrome] and bumps
 * typography on the main pane. Esc exits.
 *
 * Mounted once in AppShell. No props, no DB.
 */
export function PresentMode() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isPresent = params.get("present") === "1";

  useEffect(() => {
    if (isPresent) {
      document.documentElement.classList.add("present-mode");
    } else {
      document.documentElement.classList.remove("present-mode");
    }
    return () => document.documentElement.classList.remove("present-mode");
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(pathname ?? "/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresent, router, pathname]);

  if (!isPresent) return null;

  return (
    <Link
      href={pathname ?? "/"}
      title="Exit present (Esc)"
      className="bg-bg-soft border-line shadow-lift hover:bg-bg fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
    >
      <X size={14} strokeWidth={2} />
      Exit
    </Link>
  );
}

/**
 * Server-safe inline link to enter present mode on the current page.
 * Append ?present=1 to the URL. Keep `href` absolute so existing query
 * params get reset — present mode is meant to be a clean view.
 */
export function PresentLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`${href}${href.includes("?") ? "&" : "?"}present=1`}
      className={className}
    >
      {children}
    </Link>
  );
}
