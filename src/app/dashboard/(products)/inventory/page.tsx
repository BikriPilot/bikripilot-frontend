"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { LowStockList } from "@/components/inventory/LowStockList";
import { MovementTable } from "@/components/inventory/MovementTable";
import { PurchaseDialog } from "@/components/inventory/PurchaseDialog";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { inventoryApi } from "@/lib/api/inventory.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [tab, setTab] = useState<"low" | "movements" | "purchase">("low");
  const [purchase, setPurchase] = useState(false);
  const { shopId, can } = useCurrentShop();
  const client = useQueryClient();
  const products = useProducts({ status: "ACTIVE", limit: 100 });
  const [busy, setBusy] = useState(false);
  const savePurchase = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      await inventoryApi.purchase(shopId!, body);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["inventory", shopId] }),
        client.invalidateQueries({ queryKey: ["products", shopId] }),
        client.invalidateQueries({ queryKey: ["hisab", shopId] }),
      ]);
      toast.success(t("purchased"));
      setPurchase(false);
    } catch {
      toast.error(t("purchaseError"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          can("inventory.write") ? (
            <button
              onClick={() => setPurchase(true)}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("purchase")}
            </button>
          ) : undefined
        }
      />
      <div className="flex gap-2 border-b">
        {(
          [
            "low",
            "movements",
            ...(can("inventory.write") ? ["purchase" as const] : []),
          ] as const
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {item === "low"
              ? t("lowStock")
              : item === "purchase"
                ? t("purchase")
                : t("movements")}
          </button>
        ))}
      </div>
      {tab === "low" ? (
        <LowStockList />
      ) : tab === "movements" ? (
        <MovementTable />
      ) : (
        <button
          onClick={() => setPurchase(true)}
          className="min-h-11 rounded border px-4"
        >
          {t("purchase")}
        </button>
      )}
      {purchase && products.data ? (
        <PurchaseDialog
          products={products.data.data}
          busy={busy}
          onClose={() => setPurchase(false)}
          onSave={savePurchase}
          t={t}
        />
      ) : null}
    </div>
  );
}
