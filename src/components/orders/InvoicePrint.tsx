"use client";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { OrderDTO } from "@/types/order";
export function InvoicePrint({ order }: { order: OrderDTO }) {
  const t = useTranslations("orders");
  return <main className="mx-auto max-w-2xl space-y-6 bg-white p-6 text-slate-900 print:max-w-none"><div className="flex justify-between"><div><h1 className="text-2xl font-bold">Bikrio</h1><p>{t("invoice")}</p></div><button type="button" onClick={() => window.print()} className="rounded border px-4 py-2 print:hidden">{t("print")}</button></div><div><p className="font-semibold">{order.orderNumber}</p><p>{order.customerName} · {order.customerPhone}</p><p>{order.address}</p></div><div>{order.items.map((item) => <div key={item.id} className="flex justify-between border-b py-2"><span>{item.productName} × {item.quantity}</span><span>{formatMoney(item.lineTotalPaisa)}</span></div>)}</div><div className="flex justify-between text-lg font-bold"><span>{t("total")}</span><span>{formatMoney(order.totalPaisa)}</span></div></main>;
}
