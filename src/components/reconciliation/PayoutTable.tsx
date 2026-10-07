"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import type { PayoutDTO } from "@/types/reconciliation";

export function PayoutTable({ payouts }: { payouts: PayoutDTO[] }) {
  const t = useTranslations("reconciliation");
  return (
    <>
      <div className="space-y-2 md:hidden">
        {payouts.map((payout) => (
          <Link
            key={payout.id}
            href={`/dashboard/reconciliation/${payout.id}`}
            className="block border bg-card p-3 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {payout.courierConnection?.name ?? payout.provider}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {payout.reference || payout.id}
                </p>
              </div>
              <span className="shrink-0 rounded-sm border px-2 py-1 text-xs">
                {t(`status.${payout.status}`)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Value label={t("date")} value={formatDate(payout.payoutDate)} />
              <Value
                label={t("received")}
                value={formatMoney(payout.receivedAmountPaisa)}
              />
              <Value
                label={t("expected")}
                value={formatMoney(payout.expectedAmountPaisa)}
              />
              <Value
                label={t("difference")}
                value={formatMoney(payout.differencePaisa)}
              />
            </div>
          </Link>
        ))}
      </div>
      <div className="hidden overflow-x-auto border md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("date")}</th>
              <th className="px-4 py-3">{t("courier")}</th>
              <th className="px-4 py-3">{t("reference")}</th>
              <th className="px-4 py-3 text-right">{t("received")}</th>
              <th className="px-4 py-3 text-right">{t("expected")}</th>
              <th className="px-4 py-3 text-right">{t("difference")}</th>
              <th className="px-4 py-3">{t("statusLabel")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/reconciliation/${payout.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {formatDate(payout.payoutDate)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {payout.courierConnection?.name ?? payout.provider}
                </td>
                <td className="px-4 py-3">{payout.reference ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  {formatMoney(payout.receivedAmountPaisa)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatMoney(payout.expectedAmountPaisa)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatMoney(payout.differencePaisa)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border px-2 py-1 text-xs">
                    {t(`status.${payout.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex min-w-0 flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </p>
  );
}
