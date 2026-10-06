"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/lib/api/customers.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { CustomerInput } from "@/types/customer";
export function useCustomers(params: Record<string, string | number | boolean | undefined> = {}) {
  const { shopId } = useCurrentShop();
  return useQuery({ queryKey: ["customers", shopId, "list", params], queryFn: () => customersApi.list(shopId!, params), enabled: Boolean(shopId) });
}
export function useCustomer(id: string) {
  const { shopId } = useCurrentShop();
  return useQuery({ queryKey: ["customers", shopId, "detail", id], queryFn: () => customersApi.get(shopId!, id), enabled: Boolean(shopId && id) });
}
export function useCustomerMutations() {
  const { shopId } = useCurrentShop(); const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ["customers", shopId] });
  return {
    create: useMutation({ mutationFn: (body: CustomerInput) => customersApi.create(shopId!, body), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: CustomerInput }) => customersApi.update(shopId!, id, body), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => customersApi.remove(shopId!, id), onSuccess: invalidate }),
    block: useMutation({ mutationFn: ({ id, blocked, reason }: { id: string; blocked: boolean; reason?: string }) => customersApi.block(shopId!, id, blocked, reason), onSuccess: invalidate }),
  };
}
