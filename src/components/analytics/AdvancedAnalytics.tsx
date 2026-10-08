"use client";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { ProfitDTO, TeamStatsRowDTO } from "@/types/analytics";

export function ProfitPanel({ data }: { data: ProfitDTO }) {
  const t = useTranslations("analytics");
  const rows = [
    [t("revenue"), data.revenuePaisa],
    [t("productCost"), -data.productCostPaisa],
    [t("courierCharges"), -data.courierChargesPaisa],
    [t("codCharges"), -data.codChargesPaisa],
    [t("expenses"), -data.expensesPaisa],
  ] as const;
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t("estimatedProfit")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("profitEstimateNote")}
          </p>
        </div>
        <span
          title={t("profitFormula")}
          className="cursor-help text-sm text-muted-foreground"
        >
          ⓘ
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tabular-nums">
        {formatMoney(data.estimatedProfitPaisa)}
      </p>
      <dl className="mt-5 divide-y">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">{formatMoney(amount)}</dd>
          </div>
        ))}
      </dl>
      {data.itemsMissingCost > 0 ? (
        <p className="mt-3 text-sm text-warning">
          {t("missingCosts", { count: data.itemsMissingCost })}
        </p>
      ) : null}
    </section>
  );
}

export function TeamPerformanceTable({ data }: { data: TeamStatsRowDTO[] }) {
  const t = useTranslations("analytics");
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("teamPerformance")}</h2>
      {data.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">{t("member")}</th>
                <th className="pb-2 text-right font-medium">
                  {t("repliesSent")}
                </th>
                <th className="pb-2 text-right font-medium">
                  {t("conversationsResolved")}
                </th>
                <th className="pb-2 text-right font-medium">
                  {t("ordersCreated")}
                </th>
                <th className="pb-2 text-right font-medium">
                  {t("ordersDelivered")}
                </th>
                <th className="pb-2 text-right font-medium">
                  {t("ordersReturned")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.userId} className="border-b last:border-0">
                  <td className="py-3 pr-3">{row.name}</td>
                  <td className="py-3 text-right tabular-nums">
                    {row.repliesSent}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {row.conversationsResolved}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {row.ordersCreated}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {row.ordersDelivered}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {row.ordersReturned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{t("noTeamData")}</p>
      )}
    </section>
  );
}
