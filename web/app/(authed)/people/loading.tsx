import { SkeletonHeader, SkeletonCardGrid } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonCardGrid count={9} />
    </div>
  );
}
