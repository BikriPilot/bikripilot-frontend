"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import {
  ChartSkeleton,
  StatCardsSkeleton,
} from "@/components/common/skeletons";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  useAnalyticsInbox,
  useAnalyticsOverview,
  useAnalyticsProducts,
  useAnalyticsProfit,
  useAnalyticsSources,
  useAnalyticsStatus,
  useAnalyticsTeam,
  useAnalyticsTrend,
} from "@/hooks/queries/useAnalytics";
import { formatMoney } from "@/lib/money";
import type { AnalyticsInterval, AnalyticsRange } from "@/types/analytics";
import {
  SalesTrendChart,
  SourceBreakdownChart,
  StatusBreakdownChart,
  TopProductsTable,
} from "./AnalyticsCharts";
import { ProfitPanel, TeamPerformanceTable } from "./AdvancedAnalytics";

const tabs = [
  "overview",
  "sales",
  "products",
  "inbox",
  "profit",
  "team",
] as const;
type AnalyticsTab = (typeof tabs)[number];

const dhakaDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const dayOffset = (date: string, amount: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
};

const initialRange = (): AnalyticsRange => {
  const to = dhakaDate();
  return { from: dayOffset(to, -29), to };
};

const tabName = (value: string | null): AnalyticsTab =>
  tabs.includes(value as AnalyticsTab) ? (value as AnalyticsTab) : "overview";

export function AnalyticsPage() {
  const t = useTranslations("analytics");
  const td = useTranslations("dashboard");
  const { can } = useCurrentShop();
  const entitlements = useEntitlements();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = tabName(searchParams.get("tab"));
  const [range, setRange] = useState(initialRange);
  const [interval, setInterval] = useState<AnalyticsInterval>("day");
  const validRange =
    range.from.length === 10 &&
    range.to.length === 10 &&
    range.from <= range.to;
  const canRead = can("analytics.read");
  const advanced = entitlements.useFeature("advanced_analytics");
  const commonEnabled = canRead && validRange;

  const overview = useAnalyticsOverview(
    range,
    commonEnabled && ["overview", "sales"].includes(tab),
  );
  const trend = useAnalyticsTrend(
    range,
    interval,
    commonEnabled && ["overview", "sales"].includes(tab),
  );
  const status = useAnalyticsStatus(range, commonEnabled && tab === "overview");
  const products = useAnalyticsProducts(
    range,
    commonEnabled && ["overview", "products"].includes(tab),
  );
  const sources = useAnalyticsSources(
    range,
    commonEnabled && ["overview", "sales"].includes(tab),
  );
  const inbox = useAnalyticsInbox(
    range,
    commonEnabled && ["overview", "inbox"].includes(tab),
  );
  const profit = useAnalyticsProfit(
    range,
    commonEnabled && advanced && tab === "profit",
  );
  const team = useAnalyticsTeam(
    range,
    commonEnabled && advanced && tab === "team",
  );

  const activeQueries =
    tab === "overview"
      ? [overview, trend, status, products, sources, inbox]
      : tab === "sales"
        ? [overview, trend, sources]
        : tab === "products"
          ? [products]
          : tab === "inbox"
            ? [inbox]
            : tab === "profit" && advanced
              ? [profit]
              : tab === "team" && advanced
                ? [team]
                : [];
  const loading =
    validRange &&
    (activeQueries.some((query) => query.isLoading) ||
      ((tab === "profit" || tab === "team") && entitlements.isPending));
  const failed = activeQueries.some((query) => query.isError);
  const retry = () => activeQueries.forEach((query) => void query.refetch());
  const setTab = (next: AnalyticsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };
  const setPreset = (preset: "week" | "month" | "thisMonth") => {
    const to = dhakaDate();
    setRange({
      from:
        preset === "thisMonth"
          ? `${to.slice(0, 7)}-01`
          : dayOffset(to, preset === "week" ? -6 : -29),
      to,
    });
  };

  if (!canRead) {
    return <EmptyState title={t("permissionRequired")} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={t("description")} />
      <section className="flex flex-col gap-3 border-y py-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2" aria-label={t("dateRange")}>
          <button
            type="button"
            onClick={() => setPreset("week")}
            className="min-h-10 rounded-md border px-3 text-sm hover:bg-muted"
          >
            {t("last7Days")}
          </button>
          <button
            type="button"
            onClick={() => setPreset("month")}
            className="min-h-10 rounded-md border px-3 text-sm hover:bg-muted"
          >
            {t("last30Days")}
          </button>
          <button
            type="button"
            onClick={() => setPreset("thisMonth")}
            className="min-h-10 rounded-md border px-3 text-sm hover:bg-muted"
          >
            {t("thisMonth")}
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("from")}
            <input
              type="date"
              value={range.from}
              onChange={(event) =>
                setRange((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
              className="h-10 rounded-md border bg-background px-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("to")}
            <input
              type="date"
              value={range.to}
              onChange={(event) =>
                setRange((current) => ({ ...current, to: event.target.value }))
              }
              className="h-10 rounded-md border bg-background px-2 text-sm text-foreground"
            />
          </label>
        </div>
      </section>
      <nav
        className="flex gap-1 overflow-x-auto border-b"
        aria-label={t("tabsLabel")}
      >
        {tabs.map((item) => {
          const locked = (item === "profit" || item === "team") && !advanced;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              aria-current={tab === item ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm ${tab === item ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {locked ? <LockKeyhole size={14} /> : null}
              {t(`tabs.${item}`)}
            </button>
          );
        })}
      </nav>

      {!validRange ? (
        <div role="alert" className="text-sm text-danger">
          <EmptyState title={t("invalidRange")} />
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <StatCardsSkeleton count={4} />
          <ChartSkeleton height={300} />
        </div>
      ) : failed ? (
        <ErrorState onRetry={retry} />
      ) : tab === "profit" || tab === "team" ? (
        advanced ? (
          tab === "profit" && profit.data ? (
            <ProfitPanel data={profit.data} />
          ) : tab === "team" && team.data ? (
            <TeamPerformanceTable data={team.data} />
          ) : null
        ) : (
          <section className="flex flex-col items-start gap-4 rounded-md border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 text-muted-foreground" size={19} />
              <div>
                <h2 className="font-semibold">{t("advancedTitle")}</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {t("advancedDescription")}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex min-h-10 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {td("viewPlans")}
            </Link>
          </section>
        )
      ) : tab === "inbox" ? (
        inbox.data ? (
          <InboxPanel data={inbox.data} />
        ) : null
      ) : tab === "products" ? (
        <TopProductsTable data={products.data ?? []} />
      ) : (
        <div className="space-y-4">
          {overview.data ? <KpiCards data={overview.data} /> : null}
          {tab === "overview" ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              {trend.data ? <SalesTrendChart data={trend.data} /> : null}
              {status.data ? <StatusBreakdownChart data={status.data} /> : null}
              {products.data ? <TopProductsTable data={products.data} /> : null}
              {sources.data ? (
                <SourceBreakdownChart data={sources.data} />
              ) : null}
              {inbox.data ? <InboxPanel data={inbox.data} /> : null}
            </div>
          ) : (
            <div className="space-y-4">
              {trend.data ? <SalesTrendChart data={trend.data} /> : null}
              {sources.data ? (
                <SourceBreakdownChart data={sources.data} />
              ) : null}
              <label className="inline-flex items-center gap-2 text-sm">
                {t("interval")}
                <select
                  value={interval}
                  onChange={(event) =>
                    setInterval(event.target.value as AnalyticsInterval)
                  }
                  className="h-10 rounded-md border bg-background px-3"
                >
                  <option value="day">{t("intervals.day")}</option>
                  <option value="week">{t("intervals.week")}</option>
                  <option value="month">{t("intervals.month")}</option>
                </select>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCards({
  data,
}: {
  data: NonNullable<ReturnType<typeof useAnalyticsOverview>["data"]>;
}) {
  const t = useTranslations("analytics");
  const orderChange = percentageChange(
    data.ordersCount,
    data.previous?.ordersCount ?? null,
  );
  const revenueChange = percentageChange(
    data.deliveredRevenuePaisa,
    data.previous?.deliveredRevenuePaisa ?? null,
  );
  const cards = [
    {
      label: t("ordersCount"),
      value: String(data.ordersCount),
      change: orderChange,
    },
    {
      label: t("deliveredSales"),
      value: formatMoney(data.deliveredRevenuePaisa),
      change: revenueChange,
    },
    {
      label: t("deliverySuccessRate"),
      value:
        data.deliverySuccessRate === null
          ? t("notAvailable")
          : `${Math.round(data.deliverySuccessRate * 100)}%`,
    },
    {
      label: t("averageOrderValue"),
      value: formatMoney(data.averageOrderValuePaisa),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-md border bg-card p-4">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-2 break-words text-xl font-semibold tabular-nums">
            {card.value}
          </p>
          {card.change !== undefined ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {card.change === null
                ? t("noPreviousPeriod")
                : t("comparison", {
                    value: `${card.change > 0 ? "+" : ""}${card.change}%`,
                  })}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function InboxPanel({
  data,
}: {
  data: NonNullable<ReturnType<typeof useAnalyticsInbox>["data"]>;
}) {
  const t = useTranslations("analytics");
  const rows = [
    [t("conversations"), data.conversations],
    [t("messagesIn"), data.messagesIn],
    [t("messagesOut"), data.messagesOut],
    [t("aiMessages"), data.aiMessages],
    [
      t("avgFirstResponse"),
      data.avgFirstResponseSeconds === null
        ? t("notAvailable")
        : t("seconds", { count: data.avgFirstResponseSeconds }),
    ],
    [t("unansweredNow"), data.unansweredNow],
    [
      t("draftAcceptanceRate"),
      data.draftAcceptanceRate === null
        ? t("notAvailable")
        : `${Math.round(data.draftAcceptanceRate * 100)}%`,
    ],
  ] as const;
  return (
    <section className="rounded-md border bg-card p-4 md:p-5">
      <h2 className="font-semibold">{t("inboxStats")}</h2>
      <dl className="mt-3 divide-y">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function percentageChange(current: number, previous: number | null) {
  if (previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
