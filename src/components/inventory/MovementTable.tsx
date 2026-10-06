"use client";
import { useTranslations } from "next-intl";
import { useInventory } from "@/hooks/queries/useInventory";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { TableSkeleton } from "@/components/common/skeletons";
export function MovementTable() {
  const t = useTranslations("inventory");
  const query = useInventory("movements");
  if (query.isPending) return <TableSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const items = !Array.isArray(query.data) ? query.data?.data ?? [] : [];
  if (!items.length) return <EmptyState title={t("noMovements")} />;
  return <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-4 py-3">{t("date")}</th><th className="px-4 py-3">{t("reason")}</th><th className="px-4 py-3">{t("change")}</th><th className="px-4 py-3">{t("note")}</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleString("en-GB")}</td><td className="px-4 py-3">{item.reason}</td><td className={`px-4 py-3 font-semibold ${item.change < 0 ? "text-danger" : "text-success"}`}>{item.change > 0 ? "+" : ""}{item.change}</td><td className="px-4 py-3">{item.note ?? "—"}</td></tr>)}</tbody></table></div>;
}
