import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="bg-card border-line space-y-4 rounded-md border p-5 sm:p-8">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-40" />
        <Skeleton className="mx-auto mt-6 h-24 w-full max-w-md" />
      </div>
    </div>
  );
}
