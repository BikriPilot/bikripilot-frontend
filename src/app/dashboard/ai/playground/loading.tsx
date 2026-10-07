import { PageHeaderSkeleton } from '@/components/common/skeletons/Skeletons';

export default function AiPlaygroundLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[600px] rounded-2xl bg-muted/60 skeleton-shimmer" />
        <div className="h-96 rounded-2xl bg-muted/60 skeleton-shimmer" />
      </div>
    </div>
  );
}
