import {
  ChartSkeleton,
  StatCardsSkeleton,
} from "@/components/common/skeletons";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-4">
      <StatCardsSkeleton count={4} />
      <ChartSkeleton height={300} />
    </div>
  );
}
