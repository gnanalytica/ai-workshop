import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Inline action button used inside handbook copy. Renders a Next.js Link
 * styled as a small secondary button so handbook prose says "do X" instead
 * of leaking pathnames.
 */
export function HandbookAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant="secondary" size="sm" className="mr-2 mt-1">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
