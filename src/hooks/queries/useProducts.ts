"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { ProductInput } from "@/types/product";

export function useProducts(params: Record<string, string | number | boolean | undefined> = {}) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: ["products", shopId, "list", params],
    queryFn: () => productsApi.list(shopId!, params),
    enabled: Boolean(shopId),
  });
}
export function useProduct(productId: string) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: ["products", shopId, "detail", productId],
    queryFn: () => productsApi.get(shopId!, productId),
    enabled: Boolean(shopId && productId),
  });
}
export function useCategories() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: ["products", shopId, "categories"],
    queryFn: () => productsApi.categories(shopId!),
    enabled: Boolean(shopId),
  });
}
export function useProductMutations() {
  const { shopId } = useCurrentShop();
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ["products", shopId] });
  return {
    create: useMutation({ mutationFn: (body: ProductInput) => productsApi.create(shopId!, body), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<ProductInput> }) => productsApi.update(shopId!, id, body), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => productsApi.remove(shopId!, id), onSuccess: invalidate }),
    importCsv: useMutation({ mutationFn: (file: File) => productsApi.importCsv(shopId!, file), onSuccess: invalidate }),
  };
}
