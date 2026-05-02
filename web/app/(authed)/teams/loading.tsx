import { Skeleton, SkeletonCardGrid, SkeletonHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <Skeleton className="h-9 w-40" />
      <SkeletonCardGrid count={6} />
    </div>
  );
}
