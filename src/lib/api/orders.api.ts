import { api } from "@/lib/api/client";
import type { OrderDTO, OrderListItemDTO, OrderTotalsDTO } from "@/types/order";
import type { PageMeta } from "@/types/product";
const path = (shopId: string, suffix = "") =>
  `/shops/${shopId}/orders${suffix}`;
export const ordersApi = {
  callVerification: (shopId: string, id: string, verified: boolean) =>
    api
      .post<{ data: OrderDTO }>(path(shopId, `/${id}/call-verification`), {
        verified,
      })
      .then((response) => response.data.data),
  bulkStatus: (
    shopId: string,
    orderIds: string[],
    toStatus: string,
    cancelReason?: string,
  ) =>
    api
      .post<{
        data: {
          succeeded: string[];
          failed: { id: string; code: string; message: string }[];
        };
      }>(path(shopId, "/bulk-status"), {
        orderIds,
        toStatus,
        ...(cancelReason ? { cancelReason } : {}),
      })
      .then((response) => response.data.data),
  update: (shopId: string, id: string, body: Record<string, unknown>) =>
    api
      .patch<{ data: OrderDTO }>(path(shopId, `/${id}`), body)
      .then((response) => response.data.data),
  checkDuplicate: (
    shopId: string,
    body: { phone: string; productIds: string[]; excludeOrderId?: string },
  ) =>
    api
      .post<{
        data: {
          isDuplicateSuspect: boolean;
          matches: { orderId: string; orderNumber: string }[];
        };
      }>(path(shopId, "/check-duplicate"), body)
      .then((response) => response.data.data),
  downloadExport: async (
    shopId: string,
    params: Record<string, string | number | undefined>,
  ) => {
    const response = await api.get<Blob>(path(shopId, "/export"), {
      params,
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  payment: (shopId: string, id: string, body: Record<string, unknown>) =>
    api
      .post<{ data: OrderDTO }>(path(shopId, `/${id}/payments`), body)
      .then((r) => r.data.data),
  list: (shopId: string, params: Record<string, string | number | undefined>) =>
    api
      .get<{ data: OrderListItemDTO[]; meta: PageMeta }>(path(shopId), {
        params,
      })
      .then((r) => r.data),
  get: (shopId: string, id: string) =>
    api
      .get<{ data: OrderDTO }>(path(shopId, `/${id}`))
      .then((r) => r.data.data),
  quote: (shopId: string, body: Record<string, unknown>) =>
    api
      .post<{ data: OrderTotalsDTO }>(path(shopId, "/quote"), body)
      .then((r) => r.data.data),
  create: (shopId: string, body: Record<string, unknown>) =>
    api.post<{ data: OrderDTO }>(path(shopId), body).then((r) => r.data.data),
  status: (shopId: string, id: string, body: Record<string, unknown>) =>
    api
      .post<{ data: OrderDTO }>(path(shopId, `/${id}/status`), body)
      .then((r) => r.data.data),
};
