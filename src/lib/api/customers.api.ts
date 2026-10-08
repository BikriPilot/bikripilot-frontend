import { api } from "./client";
import type {
  CustomerDTO,
  CustomerInput,
  CustomerListItemDTO,
  CustomerOrderDTO,
} from "@/types/customer";
import type { PageMeta } from "@/types/product";
const path = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;
export const customersApi = {
  list: (
    shopId: string,
    params: Record<string, string | number | boolean | undefined>,
  ) =>
    api
      .get<{ data: CustomerListItemDTO[]; meta: PageMeta }>(
        path(shopId, "/customers"),
        { params },
      )
      .then((r) => r.data),
  get: (shopId: string, id: string) =>
    api
      .get<{ data: CustomerDTO }>(path(shopId, `/customers/${id}`))
      .then((r) => r.data.data),
  create: (shopId: string, body: CustomerInput) =>
    api
      .post<{ data: CustomerDTO }>(path(shopId, "/customers"), body)
      .then((r) => r.data.data),
  update: (shopId: string, id: string, body: CustomerInput) =>
    api
      .patch<{ data: CustomerDTO }>(path(shopId, `/customers/${id}`), body)
      .then((r) => r.data.data),
  remove: (shopId: string, id: string) =>
    api.delete(path(shopId, `/customers/${id}`)),
  block: (shopId: string, id: string, blocked: boolean, reason?: string) =>
    api
      .post<{ data: CustomerDTO }>(path(shopId, `/customers/${id}/block`), {
        blocked,
        reason,
      })
      .then((r) => r.data.data),
  orders: (shopId: string, id: string, params: Record<string, number>) =>
    api
      .get<{ data: CustomerOrderDTO[]; meta: PageMeta }>(
        path(shopId, `/customers/${id}/orders`),
        { params },
      )
      .then((r) => r.data),
  downloadExport: async (
    shopId: string,
    params: Record<string, string | boolean | undefined> = {},
  ) => {
    const response = await api.get<Blob>(path(shopId, "/customers/export"), {
      params,
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
