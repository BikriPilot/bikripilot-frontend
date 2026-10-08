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
const downloadCsv = async (
  shopId: string,
  suffix: string,
  filename: string,
) => {
  const response = await api.get<Blob>(path(shopId, suffix), {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const productsApi = {
  list: async (
    shopId: string,
    params: Record<string, string | number | boolean | undefined>,
  ) =>
    api
      .get<{ data: ProductListItemDTO[]; meta?: PageMeta }>(
        path(shopId, "/products"),
        { params },
      )
      .then((response) => response.data),
  get: (shopId: string, productId: string) =>
    api
      .get<{ data: ProductDTO }>(path(shopId, `/products/${productId}`))
      .then((r) => r.data.data),
  create: (shopId: string, body: ProductInput) =>
    api
      .post<{ data: ProductDTO }>(path(shopId, "/products"), body)
      .then((r) => r.data.data),
  update: (shopId: string, productId: string, body: Partial<ProductInput>) =>
    api
      .patch<{ data: ProductDTO }>(path(shopId, `/products/${productId}`), body)
      .then((r) => r.data.data),
  remove: (shopId: string, productId: string) =>
    api.delete(path(shopId, `/products/${productId}`)),
  categories: (shopId: string) =>
    api
      .get<{ data: CategoryDTO[] }>(path(shopId, "/categories"))
      .then((r) => r.data.data),
  createCategory: (shopId: string, name: string) =>
    api
      .post<{ data: CategoryDTO }>(path(shopId, "/categories"), { name })
      .then((response) => response.data.data),
  updateCategory: (shopId: string, categoryId: string, name: string) =>
    api
      .patch<{ data: CategoryDTO }>(path(shopId, `/categories/${categoryId}`), {
        name,
      })
      .then((response) => response.data.data),
  removeCategory: (shopId: string, categoryId: string) =>
    api.delete(path(shopId, `/categories/${categoryId}`)),
  importCsv: (shopId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return api
      .post<{ data: CsvImportResultDTO }>(
        path(shopId, "/products/import"),
        body,
      )
      .then((r) => r.data.data);
  },
  downloadTemplate: (shopId: string) =>
    downloadCsv(shopId, "/products/template.csv", "products-template.csv"),
  downloadExport: (shopId: string) =>
    downloadCsv(shopId, "/products/export", "products.csv"),
};
