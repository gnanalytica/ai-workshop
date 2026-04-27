import { SkeletonHeader, SkeletonRow } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonRow count={6} />
    </div>
  );
}
