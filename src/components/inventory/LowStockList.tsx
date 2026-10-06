"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useInventory } from "@/hooks/queries/useInventory";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { StockAdjustDialog } from "./StockAdjustDialog";
import { formatMoney } from "@/lib/money";

export function LowStockList() {
  const t = useTranslations("inventory");
  const query = useInventory("low-stock");
  if (query.isPending) return <ResponsiveListSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const items = Array.isArray(query.data) ? query.data : [];
  if (!items.length) return <EmptyState title={t("noLowStock")} />;
  return <div className="grid gap-3">{items.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-4"><div className="min-w-0 flex-1"><Link href={`/dashboard/products/${item.id}`} className="font-semibold text-primary break-words">{item.name}</Link><p className="text-sm text-muted-foreground">{formatMoney(item.pricePaisa)} · <span className="text-danger">{item.stockQuantity} {t("inStock")}</span></p></div><StockAdjustDialog productId={item.id} onDone={() => void query.refetch()} /></article>)}</div>;
}
