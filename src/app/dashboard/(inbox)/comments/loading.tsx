import { PageHeaderSkeleton, CardListSkeleton } from "@/components/common/skeletons/Skeletons";

export default function CommentsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeaderSkeleton />
      <CardListSkeleton rows={5} />
    </div>
  );
}
