import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SkeletonHeader />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
