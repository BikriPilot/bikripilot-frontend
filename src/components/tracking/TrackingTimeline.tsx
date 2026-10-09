"use client";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { PublicTrackingDTO } from "@/types/order";
export function TrackingTimeline({ data }: { data: PublicTrackingDTO }) {
  const t = useTranslations("tracking");
  const orders = useTranslations("orders");
  return (
    <div className="mx-auto max-w-2xl space-y-5 border-y bg-card p-5">
      <header>
        <h1 className="text-2xl font-semibold">{data.orderNumber}</h1>
        <p className="text-muted-foreground">{data.shopName}</p>
      </header>
      <div className="flex justify-between gap-3 rounded-lg bg-muted p-4">
        <span>{t("status")}</span>
        <strong>{orders(`status.${data.status}`)}</strong>
      </div>
      <section>
        <h2 className="font-semibold">{t("timeline")}</h2>
        <div className="mt-3 space-y-3">
          {data.timeline.map((item) => (
            <div key={`${item.status}-${item.at}`} className="flex gap-3">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
              <span>
                {orders(`status.${item.status}`)}
                <small className="ml-2 text-muted-foreground">
                  {new Date(item.at).toLocaleDateString("en-GB", {
                    timeZone: "Asia/Dhaka",
                  })}
                </small>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-semibold">{t("items")}</h2>
        {data.items.map((item) => (
          <p
            key={`${item.name}-${item.variantName}`}
            className="break-words py-2 text-sm"
          >
            {item.name}
            {item.variantName ? ` (${item.variantName})` : ""} × {item.quantity}
          </p>
        ))}
      </section>
      <div className="flex justify-between gap-3 border-t pt-4 font-semibold">
        <span>{t("total")}</span>
        <span>{formatMoney(data.totalPaisa)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span>{orders("advance.remaining")}</span>
        <span>{formatMoney(data.codAmountPaisa)}</span>
      </div>
      {data.shipment && (
        <p className="break-all">{data.shipment.trackingCode || "-"}</p>
      )}
      {data.showBranding && (
        <p className="text-sm text-muted-foreground">{t("poweredBy")}</p>
      )}
    </div>
  );
}
