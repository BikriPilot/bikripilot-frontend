"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import { useProductMutations, useProducts } from "@/hooks/queries/useProducts";
import { productsApi } from "@/lib/api/products.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { ProductListItemDTO } from "@/types/product";

export function ProductList() {
  const t = useTranslations("products");
  const { shopId } = useCurrentShop();
  const [search, setSearch] = useState("");
  const query = useProducts({ page: 1, limit: 50, search: search || undefined, sort: "name", order: "asc" });
  const mutations = useProductMutations();
  const items = query.data?.data ?? [];
  const remove = async (item: ProductListItemDTO) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try { await mutations.remove.mutateAsync(item.id); toast.success(t("deleted")); } catch { toast.error(t("deleteError")); }
  };
  return <div className="space-y-6"><PageHeader title={t("title")} description={t("description")} action={<Link href="/dashboard/products/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("addProduct")}</Link>} /><div className="flex flex-col gap-3 sm:flex-row"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="h-11 flex-1 rounded-lg border bg-card px-3 text-base" /><label className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold cursor-pointer">{t("importCsv")}<input type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file || !shopId) return; try { const result = await mutations.importCsv.mutateAsync(file); toast.success(`${t("imported")}: ${result.imported}`); if (result.errors.length) toast.error(`${t("importErrors")}: ${result.errors.length}`); } catch { toast.error(t("importError")); } }} /></label>{shopId ? <a href={productsApi.templateUrl(shopId)} className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold">{t("template")}</a> : null}{shopId ? <a href={productsApi.exportUrl(shopId)} className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold">{t("exportCsv")}</a> : null}</div>{query.isPending ? <ResponsiveListSkeleton /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : items.length === 0 ? <EmptyState title={t("empty")} action={<Link href="/dashboard/products/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("addFirst")}</Link>} /> : <><div className="grid gap-3 md:hidden">{items.map((item) => <ProductCard key={item.id} item={item} onDelete={() => void remove(item)} />)}</div><div className="hidden overflow-x-auto rounded-2xl border bg-card md:block"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/50"><tr>{[t("product"), t("price"), t("stock"), t("status"), ""].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-3"><Link href={`/dashboard/products/${item.id}`} className="font-semibold text-primary">{item.name}</Link><div className="text-xs text-muted-foreground">{item.category?.name ?? t("noCategory")}</div></td><td className="px-4 py-3">{formatMoney(item.pricePaisa)}</td><td className={`px-4 py-3 ${item.isLowStock ? "font-semibold text-danger" : ""}`}>{item.stockQuantity}</td><td className="px-4 py-3">{t(item.status.toLowerCase() as "active" | "draft" | "archived")}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => void remove(item)} className="text-danger">{t("delete")}</button></td></tr>)}</tbody></table></div></>}</div>;
}
function ProductCard({ item, onDelete }: { item: ProductListItemDTO; onDelete: () => void }) { const t = useTranslations("products"); return <article className="flex items-center gap-3 rounded-xl border bg-card p-3"><div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">{item.image ? <img src={item.image} alt="" className="size-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><Link href={`/dashboard/products/${item.id}`} className="font-semibold text-primary break-words">{item.name}</Link><p className="text-sm">{formatMoney(item.pricePaisa)} · <span className={item.isLowStock ? "text-danger" : ""}>{item.stockQuantity} {t("inStock")}</span></p></div><button type="button" onClick={onDelete} className="text-xs text-danger">{t("delete")}</button></article>; }
