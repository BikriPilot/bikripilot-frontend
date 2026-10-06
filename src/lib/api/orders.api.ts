import { api } from "@/lib/api/client";
import type { OrderDTO, OrderListItemDTO, OrderTotalsDTO } from "@/types/order";
import type { PageMeta } from "@/types/product";
const path = (shopId: string, suffix = "") => `/shops/${shopId}/orders${suffix}`;
export const ordersApi = {
  list: (shopId: string, params: Record<string, string | number | undefined>) =>
    api.get<{ data: OrderListItemDTO[]; meta: PageMeta }>(path(shopId), { params }).then((r) => r.data),
  get: (shopId: string, id: string) => api.get<{ data: OrderDTO }>(path(shopId, `/${id}`)).then((r) => r.data.data),
  quote: (shopId: string, body: Record<string, unknown>) => api.post<{ data: OrderTotalsDTO }>(path(shopId, "/quote"), body).then((r) => r.data.data),
  create: (shopId: string, body: Record<string, unknown>) => api.post<{ data: OrderDTO }>(path(shopId), body).then((r) => r.data.data),
  status: (shopId: string, id: string, body: Record<string, unknown>) => api.post<{ data: OrderDTO }>(path(shopId, `/${id}/status`), body).then((r) => r.data.data),
};
