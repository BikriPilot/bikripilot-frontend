"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/date";
import type { OrderListItemDTO } from "@/types/order";
export function OrderTable({ items }: { items: OrderListItemDTO[] }) {
  const t = useTranslations("orders");
  return <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/50"><tr>{["number","customer","total","statusLabel","date"].map((key) => <th key={key} className="px-4 py-3 font-semibold">{t(key)}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-3"><Link className="font-semibold text-primary" href={`/dashboard/orders/${item.id}`}>{item.orderNumber}</Link></td><td className="px-4 py-3">{item.customerName}<div className="text-xs text-muted-foreground">{item.customerPhone}</div></td><td className="px-4 py-3">{formatMoney(item.totalPaisa)}</td><td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs">{t(`status.${item.status}`)}</span></td><td className="px-4 py-3">{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>;
}
