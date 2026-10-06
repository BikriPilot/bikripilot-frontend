import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  CardListSkeleton,
} from "@/components/common/skeletons";
export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <CardListSkeleton />
    </div>
  );
}
