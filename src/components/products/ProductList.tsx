"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import {
  useCategories,
  useProductMutations,
  useProducts,
} from "@/hooks/queries/useProducts";
import { productsApi } from "@/lib/api/products.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { CsvImportResultDTO, ProductListItemDTO } from "@/types/product";
import { useEntitlements } from "@/hooks/useEntitlements";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StockAdjustDialog } from "@/components/inventory/StockAdjustDialog";

export function ProductList() {
  const t = useTranslations("products");
  const { shopId, can } = useCurrentShop();
  const canWrite = can("product.write");
  const categories = useCategories();
  const entitlements = useEntitlements();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const importDialog = useRef<HTMLDialogElement>(null);
  const [importResult, setImportResult] = useState<CsvImportResultDTO | null>(
    null,
  );
  const [importFailed, setImportFailed] = useState(false);
  const [importErrors, setImportErrors] = useState<
    Array<{ row: number; message: string }>
  >([]);
  const query = useProducts({
    page,
    limit: 20,
    status: status || undefined,
    categoryId: categoryId || undefined,
    lowStock: lowStock || undefined,
    search: search || undefined,
    sort: "name",
    order: "asc",
  });
  const mutations = useProductMutations();
  const items = query.data?.data ?? [];
  const [downloading, setDownloading] = useState(false);
  const download = async (kind: "template" | "export") => {
    if (!shopId || downloading) return;
    setDownloading(true);
    try {
      if (kind === "template") await productsApi.downloadTemplate(shopId);
      else await productsApi.downloadExport(shopId);
    } catch {
      toast.error(t("saveError"));
    } finally {
      setDownloading(false);
    }
  };
  const remove = async (item: ProductListItemDTO) => {
    if (!canWrite) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await mutations.remove.mutateAsync(item.id);
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          canWrite ? (
            <Link
              href="/dashboard/products/new"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("addProduct")}
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("search")}
          aria-label={t("search")}
          className="h-11 min-w-0 flex-1 rounded-lg border bg-card px-3 text-base"
        />
        <select
          aria-label={t("status")}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-lg border bg-card px-3"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="ACTIVE">{t("active")}</option>
          <option value="DRAFT">{t("draft")}</option>
          <option value="ARCHIVED">{t("archived")}</option>
        </select>
        <select
          aria-label={t("category")}
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          className="h-11 max-w-full rounded-lg border bg-card px-3"
        >
          <option value="">{t("allCategories")}</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(event) => {
              setLowStock(event.target.checked);
              setPage(1);
            }}
          />
          {t("lowStockOnly")}
        </label>
        {canWrite ? (
          <button
            type="button"
            onClick={() => importDialog.current?.showModal()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold"
          >
            {t("importCsv")}
          </button>
        ) : null}
        {shopId ? (
          <button
            type="button"
            disabled={downloading}
            onClick={() => void download("template")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold"
          >
            {t("template")}
          </button>
        ) : null}
        {shopId && entitlements.useFeature("csv_export") ? (
          <button
            type="button"
            disabled={downloading}
            onClick={() => void download("export")}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold"
          >
            {t("exportCsv")}
          </button>
        ) : null}
      </div>
      {canWrite ? (
        <dialog
          ref={importDialog}
          aria-label={t("importCsv")}
          className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border bg-card p-5 text-foreground backdrop:bg-black/40"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("importCsv")}</h2>
            <button
              type="button"
              disabled={downloading}
              onClick={() => void download("template")}
              className="min-h-11 rounded-lg border px-3"
            >
              {t("template")}
            </button>
            <label className="grid gap-2 text-sm">
              <span>{t("csvFile")}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={mutations.importCsv?.isPending}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !shopId) return;
                  setImportFailed(false);
                  setImportResult(null);
                  try {
                    const result = await mutations.importCsv.mutateAsync(file);
                    setImportResult(result);
                    setImportErrors(result.errors);
                  } catch {
                    setImportFailed(true);
                  }
                }}
              />
            </label>
            {mutations.importCsv?.isPending ? (
              <p role="status">{t("importing")}</p>
            ) : null}
            {importFailed ? (
              <p role="alert" className="text-danger">
                {t("importError")}
              </p>
            ) : null}
            {importResult ? (
              <div role="status" className="space-y-2">
                <p>
                  {t("createdCount")}: {importResult.created} ·{" "}
                  {t("updatedCount")}: {importResult.updated}
                </p>
                <ul className="space-y-1 text-sm">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>
                      {t("row")} {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <button
              type="button"
              disabled={mutations.importCsv?.isPending}
              onClick={() => importDialog.current?.close()}
              className="min-h-11 rounded-lg border px-3"
            >
              {t("cancel")}
            </button>
          </div>
        </dialog>
      ) : null}
      {importErrors.length ? (
        <section
          aria-label={t("importErrors")}
          className="max-h-64 overflow-auto border-l-4 border-danger pl-3"
        >
          <h2 className="font-semibold">{t("importErrors")}</h2>
          <ul className="space-y-1 text-sm">
            {importErrors.map((error, index) => (
              <li key={`${error.row}-${index}`}>
                {t("row")} {error.row}: {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {query.isPending ? (
        <ResponsiveListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("empty")}
          action={
            canWrite ? (
              <Link
                href="/dashboard/products/new"
                className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {t("addFirst")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                canWrite={canWrite}
                onDelete={() => void remove(item)}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {[t("product"), t("price"), t("stock"), t("status"), ""].map(
                    (label) => (
                      <th key={label} className="px-4 py-3 font-semibold">
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/products/${item.id}`}
                        className="font-semibold text-primary"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {item.category?.name ?? t("noCategory")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatMoney(item.pricePaisa)}
                    </td>
                    <td
                      className={`px-4 py-3 ${item.isLowStock ? "font-semibold text-danger" : ""}`}
                    >
                      {item.stockQuantity}
                    </td>
                    <td className="px-4 py-3">
                      {t(
                        item.status.toLowerCase() as
                          "active" | "draft" | "archived",
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StockAdjustDialog productId={item.id} />
                      {canWrite ? (
                        <button
                          type="button"
                          onClick={() => void remove(item)}
                          className="text-danger"
                        >
                          {t("delete")}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {query.data?.meta && query.data.meta.totalPages > 1 ? (
        <nav
          aria-label={t("pagination")}
          className="flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={page <= 1 || query.isFetching}
            title={t("previousPage")}
            aria-label={t("previousPage")}
            onClick={() => setPage(page - 1)}
            className="inline-flex size-11 items-center justify-center rounded-lg border"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm">
            {page} / {query.data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= query.data.meta.totalPages || query.isFetching}
            title={t("nextPage")}
            aria-label={t("nextPage")}
            onClick={() => setPage(page + 1)}
            className="inline-flex size-11 items-center justify-center rounded-lg border"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
function ProductCard({
  item,
  onDelete,
  canWrite,
}: {
  item: ProductListItemDTO;
  onDelete: () => void;
  canWrite: boolean;
}) {
  const t = useTranslations("products");
  return (
    <article className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/products/${item.id}`}
          className="font-semibold text-primary break-words"
        >
          {item.name}
        </Link>
        <p className="text-sm">
          {formatMoney(item.pricePaisa)} ·{" "}
          <span className={item.isLowStock ? "text-danger" : ""}>
            {item.stockQuantity} {t("inStock")}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <StockAdjustDialog productId={item.id} />
        {canWrite ? (
          <button
            type="button"
            onClick={onDelete}
            className="min-h-11 text-xs text-danger"
          >
            {t("delete")}
          </button>
        ) : null}
      </div>
    </article>
  );
}
