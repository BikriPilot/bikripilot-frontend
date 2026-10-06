"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import { useOrder, useOrderMutations } from "@/hooks/queries/useOrders";
export function OrderDetail({ orderId }: { orderId: string }) {
  const t = useTranslations("orders"); const query = useOrder(orderId); const status = useOrderMutations().status;
  if (query.isPending) return <DetailSkeleton />; if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const order = query.data;
  const change = async (toStatus: string) => { try { await status.mutateAsync({ id: order.id, body: { toStatus } }); toast.success(t("updated")); } catch { toast.error(t("saveError")); } };
  const items = order.items ?? [];
  const statusEvents = order.statusEvents ?? [];
  const allowedTransitions = order.allowedTransitions ?? [];
  return <div className="space-y-5"><header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">{t("order")}</p><h1 className="text-2xl font-semibold">{order.orderNumber}</h1></div><div className="flex gap-2"><Link href={`/dashboard/orders/${order.id}/print`} className="rounded-lg border px-4 py-2 text-sm">{t("print")}</Link>{allowedTransitions.map((next) => <button key={next} type="button" onClick={() => void change(next)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t(`status.${next}`)}</button>)}</div></header><section className="grid gap-4 lg:grid-cols-[2fr_1fr]"><div className="rounded-2xl border bg-card p-5"><h2 className="font-semibold">{t("items")}</h2>{items.length ? items.map((item) => <div key={item.id} className="flex justify-between border-b py-3 last:border-0"><span>{item.productName} × {item.quantity}</span><span>{formatMoney(item.lineTotalPaisa)}</span></div>) : <p className="py-4 text-sm text-muted-foreground">{t("noItems")}</p>}<div className="mt-4 flex justify-between font-semibold"><span>{t("total")}</span><span>{formatMoney(order.totalPaisa)}</span></div></div><div className="rounded-2xl border bg-card p-5"><h2 className="font-semibold">{t("customer")}</h2><p className="mt-3">{order.customerName}</p><p className="text-sm text-muted-foreground">{order.customerPhone}</p><p className="mt-2 text-sm">{order.address}</p><p className="mt-4 rounded-full bg-muted px-3 py-2 text-center text-sm">{t(`status.${order.status}`)}</p></div></section><section className="rounded-2xl border bg-card p-5"><h2 className="font-semibold">{t("timeline")}</h2><div className="mt-3 space-y-3">{statusEvents.map((event) => <div key={event.id} className="flex gap-3 text-sm"><span className="size-2 mt-2 rounded-full bg-primary" /><span>{t(`status.${event.toStatus}`)}<span className="ml-2 text-muted-foreground">{new Date(event.createdAt).toLocaleString("en-GB")}</span></span></div>)}</div></section></div>;
}
