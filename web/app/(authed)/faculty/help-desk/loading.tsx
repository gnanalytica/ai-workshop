import { Skeleton, SkeletonHeader, SkeletonRow } from "@/components/ui/skeleton";

export default function StuckLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
      <SkeletonRow count={6} />
    </div>
  );
}
