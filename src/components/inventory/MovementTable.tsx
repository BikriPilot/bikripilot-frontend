"use client";
import { useTranslations } from "next-intl";
import { useInventory } from "@/hooks/queries/useInventory";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { TableSkeleton } from "@/components/common/skeletons";
import { formatDateTime } from "@/lib/date";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function MovementTable({ productId }: { productId?: string } = {}) {
  const t = useTranslations("inventory");
  const pagination = useTranslations("products");
  const [page, setPage] = useState(1);
  const query = useInventory("movements", productId, page);
  if (query.isPending) return <TableSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const items = !Array.isArray(query.data) ? (query.data?.data ?? []) : [];
  const meta = !Array.isArray(query.data) ? query.data?.meta : undefined;
  if (!items.length) return <EmptyState title={t("noMovements")} />;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3">{t("reason")}</th>
              <th className="px-4 py-3">{t("change")}</th>
              <th className="px-4 py-3">{t("note")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="px-4 py-3">{t(`reasons.${item.reason}`)}</td>
                <td
                  className={`px-4 py-3 font-semibold ${item.change < 0 ? "text-danger" : "text-success"}`}
                >
                  {item.change > 0 ? "+" : ""}
                  {item.change}
                </td>
                <td className="px-4 py-3">{item.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label={pagination("pagination")}
          className="flex items-center justify-between"
        >
          <button
            type="button"
            disabled={page <= 1 || query.isFetching}
            aria-label={pagination("previousPage")}
            title={pagination("previousPage")}
            onClick={() => setPage(page - 1)}
            className="inline-flex size-11 items-center justify-center rounded-lg border"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            {page} / {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages || query.isFetching}
            aria-label={pagination("nextPage")}
            title={pagination("nextPage")}
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
