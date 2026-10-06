"use client";
import { useQuery } from "@tanstack/react-query";
import { entitlementsApi } from "@/lib/api/entitlements.api";
import { useCurrentShop } from "./useCurrentShop";
export function useEntitlements() {
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: ["entitlements", shopId],
    queryFn: () => entitlementsApi.get(shopId!),
    enabled: Boolean(shopId),
    staleTime: 60_000,
  });
  const useFeature = (key: string) =>
    Boolean(query.data?.features[key]?.enabled);
  const useLimit = (key: string) => {
    const feature = query.data?.features[key];
    return {
      used: feature?.used ?? 0,
      limit: feature?.limit ?? null,
      unlimited: feature?.unlimited ?? false,
      remaining: feature?.unlimited
        ? null
        : Math.max((feature?.limit ?? 0) - (feature?.used ?? 0), 0),
    };
  };
  return { ...query, useFeature, useLimit };
}
