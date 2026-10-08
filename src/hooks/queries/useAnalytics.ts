"use client";
import { useQuery } from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { analyticsApi } from "@/lib/api/analytics.api";
import { couriersApi } from "@/lib/api/couriers.api";
import { queryKeys } from "@/lib/queryKeys";
import type { AnalyticsInterval, AnalyticsRange } from "@/types/analytics";
import type { ShipmentListQuery } from "@/types/courier";

export function useDashboardSummary() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.dashboard(shopId),
    queryFn: () => analyticsApi.dashboard(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useDashboardOnHoldCount(enabled = true) {
  const { shopId } = useCurrentShop();
  const query: ShipmentListQuery = { status: "ON_HOLD", page: 1, limit: 1 };
  return useQuery({
    queryKey: queryKeys.shipments(shopId, query),
    queryFn: () => couriersApi.listShipments(shopId!, query),
    enabled: Boolean(shopId && enabled),
    select: (result) => result.meta.total,
  });
}

export function useAnalyticsOverview(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsOverview(shopId, range),
    queryFn: () => analyticsApi.overview(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsTrend(
  range: AnalyticsRange,
  interval: AnalyticsInterval = "day",
  enabled = true,
) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsTrend(shopId, range, interval),
    queryFn: () => analyticsApi.salesTrend(shopId!, range, interval),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsStatus(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsStatus(shopId, range),
    queryFn: () => analyticsApi.statusBreakdown(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsProducts(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsProducts(shopId, range),
    queryFn: () => analyticsApi.topProducts(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsSources(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsSources(shopId, range),
    queryFn: () => analyticsApi.sources(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsInbox(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsInbox(shopId, range),
    queryFn: () => analyticsApi.inbox(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsProfit(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsProfit(shopId, range),
    queryFn: () => analyticsApi.profit(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}

export function useAnalyticsTeam(range: AnalyticsRange, enabled = true) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.analyticsTeam(shopId, range),
    queryFn: () => analyticsApi.team(shopId!, range),
    enabled: Boolean(shopId && enabled),
  });
}
