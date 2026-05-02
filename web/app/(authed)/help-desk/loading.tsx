import { Skeleton, SkeletonHeader, SkeletonRow } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <Skeleton className="h-44 w-full" />
      <SkeletonRow count={4} />
    </div>
  );
}
