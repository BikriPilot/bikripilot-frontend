"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { trackingApi } from "@/lib/api/tracking.api";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
export default function TrackingResultPage() {
  const params = useParams<{ shopSlug: string; orderNumber: string }>(); const search = useSearchParams(); const phone = search.get("phoneLast4") ?? "";
  const query = useQuery({ queryKey: ["tracking", params.shopSlug, params.orderNumber, phone], queryFn: () => trackingApi.get(params.shopSlug, params.orderNumber, phone), enabled: phone.length === 4 });
  if (query.isPending) return <DetailSkeleton />; if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />; return <main className="mx-auto max-w-5xl px-4 py-12"><TrackingTimeline data={query.data} /></main>;
}
