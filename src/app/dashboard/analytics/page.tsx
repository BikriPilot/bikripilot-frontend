"use client";
import { Suspense } from "react";
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";
import { ChartSkeleton } from "@/components/common/skeletons";

export default function AnalyticsRoute() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <ChartSkeleton height={300} />
        </div>
      }
    >
      <AnalyticsPage />
    </Suspense>
  );
}
