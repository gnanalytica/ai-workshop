import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function FacultyLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
