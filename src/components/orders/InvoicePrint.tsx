"use client";
import { useState } from "react";
import { Printer } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { OrderDTO } from "@/types/order";
export function InvoicePrint({ order }: { order: OrderDTO }) {
  const [packing, setPacking] = useState(false);
  return (
    <main
      lang="en"
      className="mx-auto max-w-2xl space-y-6 bg-white p-6 text-slate-900 print:max-w-none"
    >
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {packing ? "Packing slip" : "Invoice"}
        </h1>
        <div className="flex gap-3 print:hidden">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={packing}
              onChange={(event) => setPacking(event.target.checked)}
            />
            Packing slip
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded border px-4"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
      <div className="break-words">
        <p className="font-semibold">{order.orderNumber}</p>
        <p>
          {order.customerName} · {order.customerPhone}
        </p>
        <p>{order.address}</p>
        <p>{[order.area, order.district].filter(Boolean).join(", ")}</p>
      </div>
      <div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-4 border-b py-2"
          >
            <span>
              {item.productName}
              {item.variantName ? ` (${item.variantName})` : ""} ×{" "}
              {item.quantity}
            </span>
            {!packing && (
              <span className="shrink-0 tabular-nums">
                {formatMoney(item.lineTotalPaisa)}
              </span>
            )}
          </div>
        ))}
      </div>
      {!packing && (
        <dl className="space-y-2">
          {[
            ["Product subtotal", order.subtotalPaisa],
            ["Discount", -order.discountPaisa],
            ["Delivery charge", order.deliveryChargePaisa],
            ["Total", order.totalPaisa],
            ["Verified advance", order.advancePaidPaisa],
            ["Remaining COD", order.codAmountPaisa],
          ].map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt>{label}</dt>
              <dd className="tabular-nums">{formatMoney(Number(amount))}</dd>
            </div>
          ))}
        </dl>
      )}
      {order.note && (
        <p className="whitespace-pre-wrap break-words">{order.note}</p>
      )}
    </main>
  );
}
