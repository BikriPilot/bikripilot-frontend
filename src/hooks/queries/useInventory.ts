"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/api/inventory.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { ProductListItemDTO } from "@/types/product";

export function useInventory(
  tab: "low-stock" | "movements",
  productId?: string,
  page = 1,
) {
  const { shopId } = useCurrentShop();
  return useQuery<
    | ProductListItemDTO[]
    | {
        data: Awaited<ReturnType<typeof inventoryApi.movements>>["data"];
        meta: Awaited<ReturnType<typeof inventoryApi.movements>>["meta"];
      }
  >({
    queryKey: ["inventory", shopId, tab, productId, page],
    queryFn: () =>
      tab === "low-stock"
        ? inventoryApi.lowStock(shopId!)
        : inventoryApi.movements(shopId!, { page, limit: 20, productId }),
    enabled: Boolean(shopId),
  });
}
export function useStockAdjust() {
  const { shopId } = useCurrentShop();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      productId: string;
      variantId?: string;
      change: number;
      reason: "ADJUSTMENT" | "DAMAGED";
      note?: string;
    }) => inventoryApi.adjust(shopId!, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["inventory", shopId] });
      void client.invalidateQueries({ queryKey: ["products", shopId] });
    },
  });
}
