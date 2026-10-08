"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import {
  useCustomerMutations,
  useCustomers,
} from "@/hooks/queries/useCustomers";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { customersApi } from "@/lib/api/customers.api";
import type { CustomerListItemDTO } from "@/types/customer";
import { useEntitlements } from "@/hooks/useEntitlements";
import { formatDate } from "@/lib/date";
export function CustomerList() {
  const t = useTranslations("customers");
  const { shopId, can } = useCurrentShop();
  const writable = can("customer.write");
  const entitlements = useEntitlements();
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [blocked, setBlocked] = useState("");
  const [tag, setTag] = useState("");
  const query = useCustomers({
    page,
    limit: 20,
    blocked: blocked === "" ? undefined : blocked === "true",
    tag: tag || undefined,
    search: search || undefined,
    sort: "name",
  });
  const mutations = useCustomerMutations();
  const items = query.data?.data ?? [];
  const remove = async (item: CustomerListItemDTO) => {
    if (!writable) return;
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
          writable ? (
            <Link
              href="/dashboard/customers/new"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("add")}
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
          value={blocked}
          onChange={(event) => {
            setBlocked(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-lg border bg-card px-3"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="false">{t("active")}</option>
          <option value="true">{t("blocked")}</option>
        </select>
        <input
          aria-label={t("tagFilter")}
          placeholder={t("tagFilter")}
          value={tag}
          onChange={(event) => {
            setTag(event.target.value);
            setPage(1);
          }}
          className="h-11 min-w-0 rounded-lg border bg-card px-3"
        />
        {shopId && entitlements.useFeature("csv_export") ? (
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                await customersApi.downloadExport(shopId, {
                  search: search || undefined,
                  tag: tag || undefined,
                  blocked: blocked === "" ? undefined : blocked === "true",
                });
              } catch {
                toast.error(t("saveError"));
              } finally {
                setDownloading(false);
              }
            }}
            className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold"
          >
            {t("export")}
          </button>
        ) : null}
      </div>
      {query.isPending ? (
        <ResponsiveListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("empty")}
          action={
            writable ? (
              <Link
                href="/dashboard/customers/new"
                className="inline-flex min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
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
              <Card
                key={item.id}
                item={item}
                writable={writable}
                onDelete={() => void remove(item)}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {[
                    t("name"),
                    t("phone"),
                    t("orders"),
                    t("delivered"),
                    t("returned"),
                    t("lastOrder"),
                    t("tags"),
                    t("spent"),
                    t("status"),
                    "",
                  ].map((label) => (
                    <th key={label} className="px-4 py-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        className="font-semibold text-primary"
                        href={`/dashboard/customers/${item.id}`}
                      >
                        {item.name ?? t("unnamed")}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.phone ?? "—"}</td>
                    <td className="px-4 py-3">{item.totalOrders}</td>
                    <td className="px-4 py-3">{item.deliveredOrders}</td>
                    <td className="px-4 py-3">{item.returnedOrders}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.lastOrderAt ? formatDate(item.lastOrderAt) : "-"}
                    </td>
                    <td className="px-4 py-3">{item.tags.join(", ") || "-"}</td>
                    <td className="px-4 py-3">
                      {formatMoney(item.totalSpentPaisa)}
                    </td>
                    <td className="px-4 py-3">
                      {item.isBlocked ? t("blocked") : t("active")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {writable ? (
                        <button
                          className="text-danger"
                          onClick={() => void remove(item)}
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
          aria-label={t("title")}
          className="flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage(page - 1)}
            className="min-h-11 rounded-lg border px-3"
          >
            {t("previous")}
          </button>
          <span>
            {page} / {query.data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= query.data.meta.totalPages || query.isFetching}
            onClick={() => setPage(page + 1)}
            className="min-h-11 rounded-lg border px-3"
          >
            {t("next")}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
function Card({
  item,
  onDelete,
  writable,
}: {
  item: CustomerListItemDTO;
  onDelete: () => void;
  writable: boolean;
}) {
  const t = useTranslations("customers");
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex justify-between gap-3">
        <Link
          href={`/dashboard/customers/${item.id}`}
          className="font-semibold text-primary"
        >
          {item.name ?? t("unnamed")}
        </Link>
        {writable ? (
          <button className="min-h-11 text-xs text-danger" onClick={onDelete}>
            {t("delete")}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{item.phone ?? "—"}</p>
      <p className="mt-2 text-sm">
        {item.totalOrders} · {formatMoney(item.totalSpentPaisa)}
      </p>
      <p className="text-sm">
        {t("delivered")}: {item.deliveredOrders} · {t("returned")}:{" "}
        {item.returnedOrders}
      </p>
      <p className="text-sm">
        {t("lastOrder")}:{" "}
        {item.lastOrderAt ? formatDate(item.lastOrderAt) : "-"}
      </p>
      {item.tags.length ? (
        <p className="text-sm break-words">{item.tags.join(", ")}</p>
      ) : null}
      {item.isBlocked ? (
        <p className="text-sm font-semibold text-danger">{t("blocked")}</p>
      ) : null}
    </article>
  );
}
