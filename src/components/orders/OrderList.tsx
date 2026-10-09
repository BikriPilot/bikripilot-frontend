"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { ordersApi } from "@/lib/api/orders.api";
import { ORDER_STATUSES } from "@/constants/enums";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Layers, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { BookShipmentDialog } from "@/components/couriers/BookShipmentDialog";
import { BulkBookDialog } from "@/components/couriers/BulkBookDialog";
import { useOrders } from "@/hooks/queries/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderTable } from "./OrderTable";
import { OrderDetail } from "./OrderDetail";
import type { OrderListItemDTO } from "@/types/order";

export function OrderList({
  reviewQueue = false,
}: { reviewQueue?: boolean } = {}) {
  const t = useTranslations("orders");
  const tShip = useTranslations("shipments");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shopId, can } = useCurrentShop();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const filters = {
    page,
    limit: 20,
    sort: "createdAt",
    order: "desc",
    status: searchParams.get("status") || undefined,
    search: searchParams.get("search") || undefined,
    queue: reviewQueue ? "ai_review" : "orders",
  };
  const query = useOrders(filters);
  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    setSelectedOrderIds([]);
    router.replace(
      `${reviewQueue ? "/dashboard/ai-orders" : "/dashboard/orders"}?${params.toString()}`,
    );
  };
  const items = query.data?.data ?? [];

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<
    { id: string; message: string }[]
  >([]);
  const bulkStatus = async (toStatus: string) => {
    if (!window.confirm(t("form.confirmBulk"))) return;
    setBulkBusy(true);
    try {
      const result = await ordersApi.bulkStatus(
        shopId!,
        selectedOrderIds,
        toStatus,
      );
      setBulkErrors(result.failed);
      setSelectedOrderIds(result.failed.map((item) => item.id));
      if (result.succeeded.length) toast.success(t("updated"));
      await query.refetch();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setBulkBusy(false);
    }
  };
  const [singleBookOrder, setSingleBookOrder] =
    useState<OrderListItemDTO | null>(null);

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === items.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(items.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={reviewQueue ? t("review.title") : t("title")}
        description={reviewQueue ? t("review.description") : t("description")}
        action={
          !reviewQueue && can("order.write") ? (
            <Link
              href="/dashboard/orders/new"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("newOrder")}
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm">
          {t("form.search")}
          <input
            type="search"
            className="min-h-11 rounded-lg border bg-card px-3 text-base"
            defaultValue={filters.search}
            onBlur={(event) => setFilter("search", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                setFilter("search", event.currentTarget.value);
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t("form.filterStatus")}
          <select
            className="min-h-11 rounded-lg border bg-card px-3 text-base"
            value={filters.status || ""}
            onChange={(event) => setFilter("status", event.target.value)}
          >
            <option value="">{t("form.all")}</option>
            {ORDER_STATUSES.filter(
              (status) => !reviewQueue || ["DRAFT", "PENDING"].includes(status),
            ).map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>
        </label>
        {can("order.export") && (
          <button
            type="button"
            className="min-h-11 self-end rounded-lg border px-4"
            onClick={async () => {
              try {
                await ordersApi.downloadExport(shopId!, filters);
              } catch {
                toast.error(t("saveError"));
              }
            }}
          >
            {t("form.export")}
          </button>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {!reviewQueue &&
        (can("shipment.write") || can("order.status")) &&
        selectedOrderIds.length > 0 && (
          <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              {can("order.status") && (
                <>
                  <button
                    type="button"
                    disabled={bulkBusy}
                    className="min-h-11 rounded-lg border px-3"
                    onClick={() => void bulkStatus("CONFIRMED")}
                  >
                    {t("status.CONFIRMED")}
                  </button>
                  <button
                    type="button"
                    disabled={bulkBusy}
                    className="min-h-11 rounded-lg border px-3"
                    onClick={() => void bulkStatus("CANCELLED")}
                  >
                    {t("status.CANCELLED")}
                  </button>
                </>
              )}
              <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {selectedOrderIds.length}
              </span>
              <span className="text-sm font-medium">
                {tShip("bulk.selectedCount", {
                  count: selectedOrderIds.length,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {can("shipment.write") && (
                <button
                  type="button"
                  onClick={() => setBulkDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Layers size={14} />
                  {tShip("bulkBook")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      {bulkErrors.length > 0 && (
        <ul role="alert" className="space-y-2 text-sm text-danger">
          {bulkErrors.map((error) => (
            <li key={error.id}>
              {items.find((item) => item.id === error.id)?.orderNumber ??
                error.id}
              : {error.message}
            </li>
          ))}
        </ul>
      )}
      {query.data?.meta && query.data.meta.totalPages > 1 && (
        <nav
          aria-label={t("form.pages")}
          className="flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={page <= 1}
            className="min-h-11 rounded-lg border px-4"
            onClick={() => setFilter("page", String(page - 1))}
          >
            {t("form.previous")}
          </button>
          <span className="tabular-nums">
            {page} / {query.data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= query.data.meta.totalPages}
            className="min-h-11 rounded-lg border px-4"
            onClick={() => setFilter("page", String(page + 1))}
          >
            {t("form.next")}
          </button>
        </nav>
      )}

      {query.isPending ? (
        <ResponsiveListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={reviewQueue ? t("review.empty") : t("empty")}
          action={
            !reviewQueue && can("order.write") ? (
              <Link
                href="/dashboard/orders/new"
                className="inline-flex min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                {t("newOrder")}
              </Link>
            ) : undefined
          }
        />
      ) : reviewQueue ? (
        <div className="space-y-4">
          {items.map((item) => (
            <details
              key={item.id}
              className="rounded-lg border bg-card p-4"
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setExpandedOrderIds((current) =>
                  open
                    ? [...new Set([...current, item.id])]
                    : current.filter((id) => id !== item.id),
                );
              }}
            >
              <summary className="min-h-11 cursor-pointer">
                <span className="font-semibold">{item.orderNumber}</span>
                <span className="ml-3">
                  {item.customerName || t("customer")}
                </span>
                <span className="ml-3 text-sm text-muted-foreground">
                  {item.customerPhone}
                </span>
                <span className="ml-3 text-sm">
                  {t(`status.${item.status}`)}
                </span>
              </summary>
              <div className="mt-4 border-t pt-4">
                {expandedOrderIds.includes(item.id) && (
                  <OrderDetail orderId={item.id} />
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <OrderCard
                key={item.id}
                item={item}
                selected={selectedOrderIds.includes(item.id)}
                onToggleSelect={handleToggleSelect}
                onBookCourier={(ord) => setSingleBookOrder(ord)}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <OrderTable
              items={items}
              selectedIds={selectedOrderIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onBookCourier={(ord) => setSingleBookOrder(ord)}
            />
          </div>
        </>
      )}

      {/* Bulk Book Dialog */}
      <BulkBookDialog
        orderIds={selectedOrderIds}
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onSuccess={() => {
          setSelectedOrderIds([]);
          void query.refetch();
        }}
      />

      {/* Single Order Book Dialog */}
      {singleBookOrder && (
        <BookShipmentDialog
          order={singleBookOrder}
          open={Boolean(singleBookOrder)}
          onClose={() => {
            setSingleBookOrder(null);
            void query.refetch();
          }}
        />
      )}
    </div>
  );
}
