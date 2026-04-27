import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";

export interface PodCardProps {
  podId: string;
  name: string;
  memberCount: number;
  facultyCount: number;
  facultyNames?: readonly string[];
  href?: string;
}

export function PodCard({ name, memberCount, facultyCount, facultyNames, href }: PodCardProps) {
  const inner = (
    <Card className="hover:border-accent/50 hover:shadow-soft cursor-pointer transition-all duration-200 motion-safe:hover:-translate-y-px">
      <CardTitle>{name}</CardTitle>
      <CardSub className="mt-1">
        {memberCount} students · {facultyCount} faculty
      </CardSub>
      {facultyNames && facultyNames.length > 0 && (
        <p className="text-muted mt-3 text-sm">{facultyNames.join(", ")}</p>
      )}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
