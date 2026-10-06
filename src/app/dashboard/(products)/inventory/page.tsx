"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { LowStockList } from "@/components/inventory/LowStockList";
import { MovementTable } from "@/components/inventory/MovementTable";
export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [tab, setTab] = useState<"low" | "movements">("low");
  return <div className="space-y-6"><PageHeader title={t("title")} description={t("description")} /><div className="flex gap-2 border-b">{(["low", "movements"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{item === "low" ? t("lowStock") : t("movements")}</button>)}</div>{tab === "low" ? <LowStockList /> : <MovementTable />}</div>;
}
