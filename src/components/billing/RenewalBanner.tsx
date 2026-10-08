"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import type { InvoiceDTO } from "@/types/billing";

interface RenewalBannerProps {
  invoiceId: string;
  invoice?: InvoiceDTO;
  pending?: boolean;
  onPay: () => void;
}

export function RenewalBanner({
  invoiceId,
  invoice,
  pending = false,
  onPay,
}: RenewalBannerProps) {
  const t = useTranslations("billing");
  const locale = useLocale();
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <CalendarClock
          className="mt-0.5 shrink-0 text-warning"
          size={19}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="font-semibold">{t("renewal.title")}</h2>
          <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
            {invoice
              ? t("renewal.description", {
                  number: invoice.number,
                  plan:
                    (locale === "bn"
                      ? invoice.plan.nameBn
                      : invoice.plan.nameEn) ?? invoice.plan.nameEn,
                  date: formatDate(invoice.periodEnd),
                })
              : t("renewal.loading")}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 sm:justify-end">
        <Link
          href={`/dashboard/billing?invoice=${encodeURIComponent(invoiceId)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-card px-4 text-sm font-medium"
        >
          {t("renewal.details")}
        </Link>
        <button
          type="button"
          onClick={onPay}
          disabled={pending || !invoice}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {pending ? t("checking") : t("renewal.payNow")}
        </button>
      </div>
    </section>
  );
}
