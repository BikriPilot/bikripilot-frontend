import { TableSkeleton } from "@/components/common/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/40" />
      <div className="h-14 animate-pulse rounded-2xl bg-muted/40" />
      <TableSkeleton rows={5} />
    </div>
  );
}
