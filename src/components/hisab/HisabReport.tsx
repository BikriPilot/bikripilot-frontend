"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import dayjs from "dayjs";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useEntitlements } from "@/hooks/useEntitlements";
import { hisabApi } from "@/lib/api/hisab.api";
import { formatMoney } from "@/lib/money";
import { todayDhaka } from "./EntrySheet";
export function HisabReport() {
  const t = useTranslations("hisab");
  const locale = useLocale();
  const { shopId } = useCurrentShop();
  const entitlement = useEntitlements();
  const [from, setFrom] = useState(
    dayjs(todayDhaka()).startOf("month").format("YYYY-MM-DD"),
  );
  const [to, setTo] = useState(todayDhaka());
  const query = useQuery({
    queryKey: ["hisab", shopId, "report", from, to],
    queryFn: () => hisabApi.report(shopId!, { from, to }),
    enabled: Boolean(shopId && from && to && from <= to),
  });
  const preset = (value: string) => {
    const today = dayjs(todayDhaka());
    if (value === "today") {
      setFrom(todayDhaka());
      setTo(todayDhaka());
    } else if (value === "week") {
      setFrom(today.startOf("week").format("YYYY-MM-DD"));
      setTo(todayDhaka());
    } else if (value === "lastMonth") {
      setFrom(today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"));
      setTo(today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"));
    } else if (value === "month") {
      setFrom(today.startOf("month").format("YYYY-MM-DD"));
      setTo(todayDhaka());
    }
  };
  const exportCsv = () => {
    if (!query.data) return;
    const rows = [
      ["Date", "Sales", "Cash In", "Cash Out", "Expense"],
      ...query.data.days.map((day) => [
        day.date,
        day.salesPaisa / 100,
        day.cashInPaisa / 100,
        day.cashOutPaisa / 100,
        day.expensePaisa / 100,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.map((row) => row.join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ledger-report-${from}-${to}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label>
          {t("period")}
          <select
            defaultValue="month"
            onChange={(event) => preset(event.target.value)}
            className="block h-11 rounded border bg-card px-3"
          >
            {["today", "week", "month", "lastMonth", "custom"].map((value) => (
              <option key={value} value={value}>
                {t(`presets.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("from")}
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="block h-11 rounded border bg-card px-3"
          />
        </label>
        <label>
          {t("to")}
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="block h-11 rounded border bg-card px-3"
          />
        </label>
        {entitlement.useFeature("csv_export") && (
          <button
            onClick={exportCsv}
            disabled={!query.data}
            className="flex min-h-11 items-center gap-2 rounded border px-3"
          >
            <Download className="size-4" />
            {t("export")}
          </button>
        )}
      </div>
      {from > to && (
        <p role="alert" className="text-danger">
          {t("invalidDates")}
        </p>
      )}
      {query.isPending && from <= to && <p aria-busy="true">{t("loading")}</p>}
      {query.isError && (
        <button onClick={() => void query.refetch()}>{t("retry")}</button>
      )}
      {query.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {Object.entries(query.data.totals).map(([key, value]) => (
              <div key={key} className="border-b py-3">
                <p className="text-sm text-muted-foreground">
                  {t(`reportTotals.${key}`)}
                </p>
                <p className="font-semibold tabular-nums">
                  {formatMoney(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[
                    "date",
                    "salesPaisa",
                    "cashInPaisa",
                    "cashOutPaisa",
                    "expensePaisa",
                  ].map((key) => (
                    <th key={key} className="p-2 text-left">
                      {key === "date" ? t("date") : t(`reportTotals.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.days.map((day) => (
                  <tr key={day.date} className="border-b">
                    <td className="p-2 whitespace-nowrap">{day.date}</td>
                    {[
                      day.salesPaisa,
                      day.cashInPaisa,
                      day.cashOutPaisa,
                      day.expensePaisa,
                    ].map((value, index) => (
                      <td
                        key={index}
                        className="p-2 whitespace-nowrap tabular-nums"
                      >
                        {formatMoney(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {query.data.days.length === 0 && <p>{t("emptyEntries")}</p>}
          <h3 className="font-semibold">{t("expenseCategories")}</h3>
          {query.data.expensesByCategory.length > 0 && (
            <div className="h-60 w-full max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={query.data.expensesByCategory.map((category) => ({
                      name: locale === "bn" ? category.nameBn : category.nameEn,
                      amount: category.amountPaisa,
                    }))}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    fill="var(--primary)"
                  />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {query.data.expensesByCategory.map((category) => (
            <p
              key={category.categoryId ?? "other"}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{locale === "bn" ? category.nameBn : category.nameEn}</span>
              <span>{formatMoney(category.amountPaisa)}</span>
            </p>
          ))}
        </>
      )}
    </section>
  );
}
