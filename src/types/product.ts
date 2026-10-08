export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface CategoryDTO {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantDTO {
  id: string;
  name: string;
  options: Record<string, string>;
  sku: string | null;
  pricePaisa: number | null;
  effectivePricePaisa: number;
  costPaisa: number | null;
  stockQuantity: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductListItemDTO {
  id: string;
  name: string;
  status: ProductStatus;
  sku: string | null;
  image: string | null;
  hasVariants: boolean;
  variantCount: number;
  stockQuantity: number;
  pricePaisa: number;
  isLowStock: boolean;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO extends Omit<
  ProductListItemDTO,
  "image" | "category" | "variantCount"
> {
  description: string | null;
  category: { id: string; name: string } | null;
  compareAtPricePaisa: number | null;
  costPaisa: number | null;
  trackStock: boolean;
  lowStockThreshold: number | null;
  images: string[];
  keywords: string[];
  faq: { q: string; a: string }[];
  weightGrams: number | null;
  variants: ProductVariantDTO[];
}

export interface ProductInput {
  name: string;
  description?: string | null;
  status?: ProductStatus;
  sku?: string | null;
  categoryId?: string | null;
  pricePaisa: number;
  compareAtPricePaisa?: number | null;
  costPaisa?: number | null;
  trackStock?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number | null;
  images?: string[];
  keywords?: string[];
  faq?: { q: string; a: string }[];
  weightGrams?: number | null;
  variants?: Array<{
    id?: string;
    name: string;
    options: Record<string, string>;
    sku?: string | null;
    pricePaisa?: number | null;
    costPaisa?: number | null;
    stockQuantity?: number;
    isActive?: boolean;
    sortOrder?: number;
  }>;
}

export interface InventoryMovementDTO {
  id: string;
  productId: string;
  variantId: string | null;
  change: number;
  reason: string;
  orderId: string | null;
  purchaseRef: string | null;
  unitCostPaisa: number | null;
  note: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CsvImportResultDTO {
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}
