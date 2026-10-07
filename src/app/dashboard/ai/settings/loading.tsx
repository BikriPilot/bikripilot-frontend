import { PageHeaderSkeleton } from '@/components/common/skeletons/Skeletons';

export default function AiSettingsLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <div className="h-44 rounded-2xl bg-muted/60 skeleton-shimmer" />
        <div className="h-72 rounded-2xl bg-muted/60 skeleton-shimmer" />
      </div>
    </div>
  );
}
