"use client";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { useProduct } from "@/hooks/queries/useProducts";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { MovementTable } from "@/components/inventory/MovementTable";
import { StockAdjustDialog } from "@/components/inventory/StockAdjustDialog";
export default function ProductDetailPage() {
  const [tab, setTab] = useState<"details" | "movements">("details");
  const t = useTranslations("inventory");
  const params = useParams<{ productId: string }>();
  const query = useProduct(params.productId);
  if (query.isPending) return <DetailSkeleton />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "details"}
          onClick={() => setTab("details")}
          className="min-h-11 border-b-2 px-3"
        >
          {query.data.name}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "movements"}
          onClick={() => setTab("movements")}
          className="min-h-11 border-b-2 px-3"
        >
          {t("movements")}
        </button>
        <StockAdjustDialog productId={query.data.id} />
      </div>
      {tab === "details" ? (
        <ProductForm product={query.data} />
      ) : (
        <MovementTable productId={query.data.id} />
      )}
    </div>
  );
}
