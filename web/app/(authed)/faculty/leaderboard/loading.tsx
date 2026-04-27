import { Skeleton, SkeletonHeader, SkeletonRow } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <Skeleton className="h-9 w-64" />
      <SkeletonRow count={10} />
    </div>
  );
}
