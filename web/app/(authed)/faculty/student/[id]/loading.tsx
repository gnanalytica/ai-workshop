import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
      <SkeletonRow count={5} />
    </div>
  );
}
