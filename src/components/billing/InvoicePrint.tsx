"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import type { InvoiceDTO } from "@/types/billing";

export function InvoicePrint({ invoice }: { invoice: InvoiceDTO }) {
  const t = useTranslations("billing");
  const locale = useLocale();
  const isBn = locale === "bn";
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!printing) return;
    const finish = () => setPrinting(false);
    window.addEventListener("afterprint", finish);
    window.print();
    return () => window.removeEventListener("afterprint", finish);
  }, [printing]);

  const planName = isBn
    ? invoice.plan.nameBn || invoice.plan.nameEn
    : invoice.plan.nameEn || invoice.plan.nameBn;

  const cycleLabel =
    invoice.billingCycle in { MONTHLY: 1, YEARLY: 1 }
      ? t(`cycles.${invoice.billingCycle as "MONTHLY" | "YEARLY"}`)
      : invoice.billingCycle;

  const statusLabel =
    invoice.status in { PENDING: 1, PAID: 1, CANCELLED: 1, REFUNDED: 1 }
      ? t(`invoice.statuses.${invoice.status as "PENDING" | "PAID" | "CANCELLED" | "REFUNDED"}`)
      : invoice.status;

  return (
    <>
      <button
        type="button"
        onClick={() => setPrinting(true)}
        aria-label={t("invoice.print")}
        title={t("invoice.print")}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border bg-card hover:border-primary hover:text-primary"
      >
        <Printer size={16} aria-hidden="true" />
      </button>
      {printing ? (
        <>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .billing-print-area, .billing-print-area * { visibility: visible !important; }
              .billing-print-area { display: block !important; position: fixed; inset: 0; width: 100%; padding: 36px; background: white; color: #171717; font-family: Arial, sans-serif; }
            }
          `}</style>
          <article className="billing-print-area hidden text-sm leading-6">
            <header className="border-b pb-5">
              <p className="text-xs uppercase">BikriPilot</p>
              <h1 className="mt-2 text-2xl font-semibold">{t("invoice.number")}</h1>
              <p>{invoice.number}</p>
            </header>
            <dl className="grid grid-cols-2 gap-4 py-5">
              <div>
                <dt className="text-neutral-500">{t("invoice.plan")}</dt>
                <dd className="font-medium">{planName}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">{t("invoice.billingCycle")}</dt>
                <dd>{cycleLabel}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">{t("invoice.period")}</dt>
                <dd>
                  {formatDate(invoice.periodStart)} –{" "}
                  {formatDate(invoice.periodEnd)}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">{t("invoice.status")}</dt>
                <dd>{statusLabel}</dd>
              </div>
            </dl>
            <dl className="grid gap-2 border-t pt-4">
              <div className="flex justify-between">
                <dt>{t("invoice.subtotal")}</dt>
                <dd>{formatMoney(invoice.subtotalPaisa)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("invoice.discount")}</dt>
                <dd>{formatMoney(invoice.discountPaisa)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("invoice.credit")}</dt>
                <dd>{formatMoney(invoice.creditPaisa)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <dt>{t("invoice.total")}</dt>
                <dd>{formatMoney(invoice.totalPaisa)}</dd>
              </div>
            </dl>
            <p className="mt-8 border-t pt-3 text-xs">
              {t("invoice.footerNote")}
            </p>
          </article>
        </>
      ) : null}
    </>
  );
}
