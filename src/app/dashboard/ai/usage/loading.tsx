import { PageHeaderSkeleton, StatCardsSkeleton } from '@/components/common/skeletons/Skeletons';

export default function AiUsageLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} />
      <div className="h-48 rounded-2xl bg-muted/60 skeleton-shimmer" />
    </div>
  );
}
