import { PageHeaderSkeleton, CardListSkeleton } from '@/components/common/skeletons/Skeletons';

export default function AiKnowledgeLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardListSkeleton rows={5} />
    </div>
  );
}
