"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { PayoutItemDTO } from "@/types/reconciliation";

export function PayoutItemsTable({ items }: { items: PayoutItemDTO[] }) {
  const t = useTranslations("reconciliation");
  return (
    <div className="overflow-x-auto border">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("consignment")}</th>
            <th className="px-4 py-3">{t("order")}</th>
            <th className="px-4 py-3">{t("statusLabel")}</th>
            <th className="px-4 py-3 text-right">{t("codCollected")}</th>
            <th className="px-4 py-3 text-right">{t("expected")}</th>
            <th className="px-4 py-3 text-right">{t("deliveryCharge")}</th>
            <th className="px-4 py-3 text-right">{t("codCharge")}</th>
            <th className="px-4 py-3 text-right">{t("received")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-mono text-xs">
                {item.consignmentId}
              </td>
              <td className="px-4 py-3">
                {item.orderId ? (
                  <Link
                    href={`/dashboard/orders/${item.orderId}`}
                    className="text-primary hover:underline"
                  >
                    {item.orderNumber}
                  </Link>
                ) : (
                  (item.orderNumber ?? "-")
                )}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-sm border px-2 py-1 text-xs">
                  {t(`matchStatus.${item.matchStatus}`)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {formatMoney(item.codCollectedPaisa)}
              </td>
              <td className="px-4 py-3 text-right">
                {item.expectedCodPaisa === null
                  ? "-"
                  : formatMoney(item.expectedCodPaisa)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatMoney(item.courierChargePaisa)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatMoney(item.codChargePaisa)}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatMoney(item.netPaisa)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
