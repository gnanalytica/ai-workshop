import { Skeleton, SkeletonHeader, SkeletonRow } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="border-line/50 flex gap-1 border-b">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <SkeletonRow count={10} />
    </div>
  );
}
