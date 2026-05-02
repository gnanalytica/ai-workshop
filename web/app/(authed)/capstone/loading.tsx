import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      <section className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </section>
    </div>
  );
}
