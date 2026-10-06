import { api } from "./client";
import type {
  CategoryDTO,
  CsvImportResultDTO,
  PageMeta,
  ProductDTO,
  ProductInput,
  ProductListItemDTO,
} from "@/types/product";

const path = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;

export const productsApi = {
  list: async (shopId: string, params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ data: ProductListItemDTO[]; meta?: PageMeta }>(path(shopId, "/products"), { params }).then((response) => response.data),
  get: (shopId: string, productId: string) =>
    api.get<{ data: ProductDTO }>(path(shopId, `/products/${productId}`)).then((r) => r.data.data),
  create: (shopId: string, body: ProductInput) =>
    api.post<{ data: ProductDTO }>(path(shopId, "/products"), body).then((r) => r.data.data),
  update: (shopId: string, productId: string, body: Partial<ProductInput>) =>
    api.patch<{ data: ProductDTO }>(path(shopId, `/products/${productId}`), body).then((r) => r.data.data),
  remove: (shopId: string, productId: string) =>
    api.delete(path(shopId, `/products/${productId}`)),
  categories: (shopId: string) =>
    api.get<{ data: CategoryDTO[] }>(path(shopId, "/categories")).then((r) => r.data.data),
  importCsv: (shopId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return api.post<{ data: CsvImportResultDTO }>(path(shopId, "/products/import"), body).then((r) => r.data.data);
  },
  templateUrl: (shopId: string) => `${api.defaults.baseURL}${path(shopId, "/products/template.csv")}`,
  exportUrl: (shopId: string) => `${api.defaults.baseURL}${path(shopId, "/products/export")}`,
};
