import Link from "next/link";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PodCardProps {
  podId: string;
  name: string;
  memberCount: number;
  facultyCount: number;
  primaryFaculty?: string | null;
  href?: string;
}

export function PodCard({ name, memberCount, facultyCount, primaryFaculty, href }: PodCardProps) {
  const inner = (
    <Card className="hover:border-accent/50 cursor-pointer transition-colors">
      <CardTitle>{name}</CardTitle>
      <CardSub className="mt-1">
        {memberCount} students · {facultyCount} faculty
      </CardSub>
      {primaryFaculty && (
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="accent">Primary</Badge>
          <span className="text-ink text-sm">{primaryFaculty}</span>
        </div>
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
