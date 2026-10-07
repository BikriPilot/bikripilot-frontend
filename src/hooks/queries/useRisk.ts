"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riskApi } from "@/lib/api/risk.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { queryKeys } from "@/lib/queryKeys";
import type { CheckRiskInput, RiskHistoryQuery } from "@/types/risk";

export function useRiskHistory(query: RiskHistoryQuery = {}) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.riskHistory(shopId, query),
    queryFn: () => riskApi.history(shopId!, query),
    enabled: Boolean(shopId),
  });
}

export function useCheckRiskMutation() {
  const { shopId } = useCurrentShop();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: CheckRiskInput) => riskApi.check(shopId!, input),
    onSuccess: (data, variables) => {
      if (shopId) {
        client.invalidateQueries({ queryKey: queryKeys.riskHistory(shopId) });
        client.invalidateQueries({ queryKey: queryKeys.riskCheck(shopId, variables.phone) });
        if (variables.orderId) {
          client.invalidateQueries({ queryKey: queryKeys.orders(shopId) });
        }
      }
    },
  });
}
