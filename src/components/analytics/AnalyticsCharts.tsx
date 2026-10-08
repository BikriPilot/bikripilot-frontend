"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/common/PageStates";
import { formatMoney } from "@/lib/money";
import type {
  SalesTrendPointDTO,
  SourceBreakdownDTO,
  StatusBreakdownDTO,
  TopProductDTO,
} from "@/types/analytics";

const statusColors: Record<string, string> = {
  DRAFT: "var(--muted-foreground)",
  PENDING: "var(--warning)",
  CONFIRMED: "var(--primary)",
  PACKED: "var(--info)",
  SHIPPED: "var(--info-soft)",
  DELIVERED: "var(--success)",
  PARTIALLY_DELIVERED: "var(--warning)",
  RETURNED: "var(--danger)",
  CANCELLED: "var(--border)",
};

export function SalesTrendChart({ data }: { data: SalesTrendPointDTO[] }) {
  const t = useTranslations("analytics");
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("salesTrend")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("salesTrendDescription")}
      </p>
      {data.length ? (
        <div className="mt-4 h-64 w-full" aria-label={t("salesTrend")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  new Date(`${value}T12:00:00Z`).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="money"
                tickFormatter={(value: number) =>
                  formatMoney(value).replace("৳", "")
                }
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={54}
              />
              <YAxis yAxisId="orders" orientation="right" hide />
              <Tooltip
                formatter={(value) => formatMoney(Number(value))}
                labelFormatter={(label) => String(label)}
                contentStyle={{ borderRadius: 6, borderColor: "var(--border)" }}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="deliveredRevenuePaisa"
                name={t("deliveredSales")}
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="bookedRevenuePaisa"
                name={t("bookedSales")}
                stroke="var(--info)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title={t("noData")} />
        </div>
      )}
    </section>
  );
}

export function StatusBreakdownChart({ data }: { data: StatusBreakdownDTO[] }) {
  const t = useTranslations("analytics");
  const statusLabel = useTranslations("dashboard.statuses");
  const visible = data.filter((item) => item.count > 0);
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("statusBreakdown")}</h2>
      {visible.length ? (
        <>
          <div className="mt-2 h-48" aria-label={t("statusBreakdown")}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visible}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={48}
                  outerRadius={74}
                  paddingAngle={2}
                >
                  {visible.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status] ?? "var(--primary)"}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => Number(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {visible.map((item) => (
              <li
                key={item.status}
                className="flex min-w-0 items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <i
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: statusColors[item.status] }}
                  />
                  <span className="truncate">{statusLabel(item.status)}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-4">
          <EmptyState title={t("noData")} />
        </div>
      )}
    </section>
  );
}

export function SourceBreakdownChart({ data }: { data: SourceBreakdownDTO[] }) {
  const t = useTranslations("analytics");
  const sourceLabel = useTranslations("analytics.sources");
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("orderSources")}</h2>
      {data.length ? (
        <div className="mt-4 h-60" aria-label={t("orderSources")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 20, left: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="source"
                tickFormatter={(value: string) => sourceLabel(value)}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => Number(value)} />
              <Bar
                dataKey="count"
                name={t("ordersCount")}
                fill="var(--info)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title={t("noData")} />
        </div>
      )}
    </section>
  );
}

export function TopProductsTable({ data }: { data: TopProductDTO[] }) {
  const t = useTranslations("analytics");
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("topProducts")}</h2>
      {data.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">{t("product")}</th>
                <th className="pb-2 text-right font-medium">{t("quantity")}</th>
                <th className="pb-2 text-right font-medium">{t("sales")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product, index) => (
                <tr
                  key={product.productId ?? `${product.name}-${index}`}
                  className="border-b last:border-0"
                >
                  <td className="max-w-48 truncate py-3 pr-3">
                    {product.name}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {product.quantity}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatMoney(product.revenuePaisa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title={t("noData")} />
        </div>
      )}
    </section>
  );
}
