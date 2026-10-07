"use client";

import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import type { ReconciliationSummaryDTO } from "@/types/reconciliation";

export function CourierMoneySummary({
  summary,
}: {
  summary: ReconciliationSummaryDTO;
}) {
  const t = useTranslations("reconciliation");
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">{t("holding")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("mismatchedPayouts")}:{" "}
          <span className="font-semibold text-foreground">
            {summary.mismatchedPayouts}
          </span>
        </p>
      </div>
      {summary.couriers.length === 0 ? (
        <p className="border-y py-6 text-sm text-muted-foreground">
          {t("noCouriers")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summary.couriers.map((courier) => (
            <article
              key={courier.courierConnectionId}
              className="min-w-0 border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{courier.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {courier.provider}
                  </p>
                </div>
                <p className="shrink-0 text-right text-lg font-semibold">
                  {formatMoney(courier.holdingPaisa)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t pt-3 text-sm">
                <span className="text-muted-foreground">
                  {t("unpaidParcels")}
                </span>
                <span className="font-medium">
                  {courier.deliveredUnpaidCount} ·{" "}
                  {formatMoney(courier.deliveredUnpaidCodPaisa)}
                </span>
              </div>
              {courier.oldestUnpaidDeliveredAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("oldestUnpaid")}:{" "}
                  {formatDate(courier.oldestUnpaidDeliveredAt)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
