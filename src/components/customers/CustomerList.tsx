"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { ResponsiveListSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import { useCustomerMutations, useCustomers } from "@/hooks/queries/useCustomers";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { customersApi } from "@/lib/api/customers.api";
import type { CustomerListItemDTO } from "@/types/customer";
export function CustomerList() {
  const t = useTranslations("customers"); const { shopId } = useCurrentShop(); const [search, setSearch] = useState("");
  const query = useCustomers({ page: 1, limit: 50, search: search || undefined, sort: "name" }); const mutations = useCustomerMutations();
  const items = query.data?.data ?? [];
  const remove = async (item: CustomerListItemDTO) => { if (!window.confirm(t("deleteConfirm"))) return; try { await mutations.remove.mutateAsync(item.id); toast.success(t("deleted")); } catch { toast.error(t("deleteError")); } };
  return <div className="space-y-6"><PageHeader title={t("title")} description={t("description")} action={<Link href="/dashboard/customers/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("add")}</Link>} /><div className="flex gap-3"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="h-11 flex-1 rounded-lg border bg-card px-3 text-base" />{shopId ? <a href={customersApi.exportUrl(shopId)} className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold">{t("export")}</a> : null}</div>{query.isPending ? <ResponsiveListSkeleton /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : items.length === 0 ? <EmptyState title={t("empty")} action={<Link href="/dashboard/customers/new" className="inline-flex min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">{t("addFirst")}</Link>} /> : <><div className="grid gap-3 md:hidden">{items.map((item) => <Card key={item.id} item={item} onDelete={() => void remove(item)} />)}</div><div className="hidden overflow-x-auto rounded-2xl border bg-card md:block"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/50"><tr>{[t("name"), t("phone"), t("orders"), t("spent"), t("status"), ""].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-3"><Link className="font-semibold text-primary" href={`/dashboard/customers/${item.id}`}>{item.name ?? t("unnamed")}</Link></td><td className="px-4 py-3">{item.phone ?? "—"}</td><td className="px-4 py-3">{item.totalOrders}</td><td className="px-4 py-3">{formatMoney(item.totalSpentPaisa)}</td><td className="px-4 py-3">{item.isBlocked ? t("blocked") : t("active")}</td><td className="px-4 py-3 text-right"><button className="text-danger" onClick={() => void remove(item)}>{t("delete")}</button></td></tr>)}</tbody></table></div></>}</div>;
}
function Card({ item, onDelete }: { item: CustomerListItemDTO; onDelete: () => void }) { const t = useTranslations("customers"); return <article className="rounded-xl border bg-card p-4"><div className="flex justify-between gap-3"><Link href={`/dashboard/customers/${item.id}`} className="font-semibold text-primary">{item.name ?? t("unnamed")}</Link><button className="text-xs text-danger" onClick={onDelete}>{t("delete")}</button></div><p className="mt-1 text-sm text-muted-foreground">{item.phone ?? "—"}</p><p className="mt-2 text-sm">{item.totalOrders} · {formatMoney(item.totalSpentPaisa)}</p></article>; }
