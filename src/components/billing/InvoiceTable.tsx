"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import type { InvoiceDTO } from "@/types/billing";
import { EmptyState } from "@/components/common/PageStates";
import { InvoicePrint } from "./InvoicePrint";

export function InvoiceTable({ invoices }: { invoices: InvoiceDTO[] }) {
  const t = useTranslations("billing");
  const locale = useLocale();

  if (!invoices.length) return <EmptyState title={t("invoice.empty")} />;

  const statusLabel = (status: InvoiceDTO["status"]) =>
    t(`invoice.statuses.${status}`);
  const kindLabel = (kind: InvoiceDTO["kind"]) => t(`kinds.${kind}`);
  const planName = (invoice: InvoiceDTO) =>
    (locale === "bn" ? invoice.plan.nameBn : invoice.plan.nameEn) ??
    invoice.plan.nameEn;

  return (
    <section className="space-y-3" aria-label={t("invoice.title")}>
      <div className="space-y-3 md:hidden">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-all font-medium">{invoice.number}</p>
                <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
                  {planName(invoice)} · {kindLabel(invoice.kind)}
                </p>
              </div>
              <InvoicePrint invoice={invoice} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="rounded-full bg-muted px-2.5 py-1">
                {statusLabel(invoice.status)}
              </span>
              <span className="font-semibold tabular-nums">
                {formatMoney(invoice.totalPaisa)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {kindLabel(invoice.kind)} · {formatDate(invoice.periodStart)} –{" "}
              {formatDate(invoice.periodEnd)}
            </p>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("invoice.number")}</th>
              <th className="px-4 py-3 font-medium">{t("invoice.kind")}</th>
              <th className="px-4 py-3 font-medium">{t("invoice.period")}</th>
              <th className="px-4 py-3 text-right font-medium">
                {t("invoice.total")}
              </th>
              <th className="px-4 py-3 font-medium">{t("invoice.status")}</th>
              <th className="px-4 py-3 text-right font-medium">
                {t("invoice.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-3">
                  <span className="font-medium">{invoice.number}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {planName(invoice)}
                  </span>
                </td>
                <td className="px-4 py-3">{kindLabel(invoice.kind)}</td>
                <td className="px-4 py-3">
                  {formatDate(invoice.periodStart)} –{" "}
                  {formatDate(invoice.periodEnd)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(invoice.totalPaisa)}
                </td>
                <td className="px-4 py-3">{statusLabel(invoice.status)}</td>
                <td className="px-4 py-3 text-right">
                  <InvoicePrint invoice={invoice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
