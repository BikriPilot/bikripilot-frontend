"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { ordersApi } from "@/lib/api/orders.api";
export function useOrders(
  params: Record<string, string | number | undefined> = {},
) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: ["orders", shopId, "list", params],
    queryFn: () => ordersApi.list(shopId!, params),
    enabled: Boolean(shopId),
  });
}
export function useOrder(id: string) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: ["orders", shopId, "detail", id],
    queryFn: () => ordersApi.get(shopId!, id),
    enabled: Boolean(shopId && id),
  });
}
export function useOrderMutations() {
  const { shopId } = useCurrentShop();
  const client = useQueryClient();
  const refresh = () =>
    Promise.all(
      [
        "orders",
        "products",
        "inventory",
        "hisab",
        "customers",
        "dashboard",
        "entitlements",
      ].map((area) => client.invalidateQueries({ queryKey: [area, shopId] })),
    );
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        ordersApi.create(shopId!, body),
      onSuccess: refresh,
    }),
    status: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: string;
        body: Record<string, unknown>;
      }) => ordersApi.status(shopId!, id, body),
      onSuccess: refresh,
    }),
  };
}
