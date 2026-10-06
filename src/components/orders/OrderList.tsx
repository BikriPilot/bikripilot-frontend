"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { useOrders } from "@/hooks/queries/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderTable } from "./OrderTable";
export function OrderList() {
  const t = useTranslations("orders"); const query = useOrders({ page: 1, limit: 50, sort: "createdAt", order: "desc" }); const items = query.data?.data ?? [];
  return <div className="space-y-6"><PageHeader title={t("title")} description={t("description")} action={<Link href="/dashboard/orders/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("newOrder")}</Link>} />{query.isPending ? <ResponsiveListSkeleton /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : items.length === 0 ? <EmptyState title={t("empty")} action={<Link href="/dashboard/orders/new" className="inline-flex min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">{t("newOrder")}</Link>} /> : <><div className="grid gap-3 md:hidden">{items.map((item) => <OrderCard key={item.id} item={item} />)}</div><div className="hidden md:block"><OrderTable items={items} /></div></>}</div>;
}
