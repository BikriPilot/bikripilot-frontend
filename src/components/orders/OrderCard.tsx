"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { OrderListItemDTO } from "@/types/order";
export function OrderCard({ item }: { item: OrderListItemDTO }) {
  const t = useTranslations("orders");
  return <Link href={`/dashboard/orders/${item.id}`} className="block rounded-xl border bg-card p-4"><div className="flex items-center justify-between"><span className="font-semibold text-primary">{item.orderNumber}</span><span className="rounded-full bg-muted px-2 py-1 text-xs">{t(`status.${item.status}`)}</span></div><p className="mt-2">{item.customerName}</p><p className="text-sm text-muted-foreground">{item.customerPhone}</p><p className="mt-2 font-semibold">{formatMoney(item.totalPaisa)}</p></Link>;
}
