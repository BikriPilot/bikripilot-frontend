import { api } from "./client";
import type { InventoryMovementDTO, PageMeta, ProductListItemDTO } from "@/types/product";

const path = (shopId: string, suffix: string) => `/shops/${shopId}${suffix}`;
export const inventoryApi = {
  lowStock: (shopId: string) =>
    api.get<{ data: ProductListItemDTO[] }>(path(shopId, "/inventory/low-stock")).then((r) => r.data.data),
  movements: (shopId: string, params: Record<string, string | number | undefined>) =>
    api.get<{ data: InventoryMovementDTO[]; meta: PageMeta }>(path(shopId, "/inventory/movements"), { params }).then((r) => r.data),
  adjust: (shopId: string, body: { productId: string; variantId?: string; change: number; reason: "ADJUSTMENT" | "DAMAGED"; note?: string }) =>
    api.post<{ data: InventoryMovementDTO }>(path(shopId, "/inventory/adjust"), body).then((r) => r.data.data),
};
