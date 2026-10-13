"use client";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  PackagePlus,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsSkeleton } from "@/components/common/skeletons";
import {
  useDashboardOnHoldCount,
  useDashboardSummary,
} from "@/hooks/queries/useAnalytics";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { formatMoney } from "@/lib/money";

const checklistConfig: Record<
  string,
  { titleKey: string; descKey: string; defaultHref: string }
> = {
  profile_details: {
    titleKey: "checklistProfileTitle",
    descKey: "checklistProfileDesc",
    defaultHref: "/dashboard/profile",
  },
  shop_details: {
    titleKey: "checklistShopTitle",
    descKey: "checklistShopDesc",
    defaultHref: "/dashboard/settings",
  },
  two_factor: {
    titleKey: "checklist2faTitle",
    descKey: "checklist2faDesc",
    defaultHref: "/dashboard/profile",
  },
  facebook_page: {
    titleKey: "checklistFbTitle",
    descKey: "checklistFbDesc",
    defaultHref: "/dashboard/channels",
  },
  whatsapp_connected: {
    titleKey: "checklistWaTitle",
    descKey: "checklistWaDesc",
    defaultHref: "/dashboard/channels",
  },
  product_added: {
    titleKey: "checklistProductTitle",
    descKey: "checklistProductDesc",
    defaultHref: "/dashboard/products/new",
  },
  ai_business_info: {
    titleKey: "checklistAiTitle",
    descKey: "checklistAiDesc",
    defaultHref: "/dashboard/ai",
  },
};

const statusKeys: Record<string, string> = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  PARTIALLY_DELIVERED: "PARTIALLY_DELIVERED",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED",
};

export function DashboardHome() {
  const t = useTranslations("dashboard");
  const tStep8 = useTranslations("step8");
  const query = useDashboardSummary();
  const { can } = useCurrentShop();
  const canReadOrders = can("order.read");
  const onHold = useDashboardOnHoldCount(canReadOrders);

  if (query.isPending || (canReadOrders && onHold.isPending)) {
    return (
      <div className="space-y-5">
        <PageHeader title={t("title")} description={t("description")} />
        <StatCardsSkeleton count={4} />
      </div>
    );
  }
  if (query.isError || !query.data || (canReadOrders && onHold.isError)) {
    return (
      <ErrorState
        onRetry={() => {
          void query.refetch();
          if (canReadOrders) void onHold.refetch();
        }}
      />
    );
  }

  const data = query.data;
  const metrics = [
    ...(can("order.read")
      ? [
          {
            label: t("ordersToday"),
            value: String(data.today.ordersCount),
            href: "/dashboard/orders",
          },
          {
            label: t("bookedSales"),
            value: formatMoney(data.today.bookedRevenuePaisa),
            href: "/dashboard/orders",
          },
          {
            label: t("pendingConfirmations"),
            value: String(data.today.pendingConfirmations),
            href: "/dashboard/orders?status=PENDING",
          },
          {
            label: t("toShip"),
            value: String(data.today.toShip),
            href: "/dashboard/orders?status=CONFIRMED,PACKED",
          },
        ]
      : []),
    ...(can("inbox.read")
      ? [
          {
            label: t("unreadConversations"),
            value: String(data.inbox.unreadConversations),
            href: "/dashboard/inbox",
          },
          {
            label: t("needsHuman"),
            value: String(data.inbox.needsHuman),
            href: "/dashboard/inbox",
          },
        ]
      : []),
    ...(can("product.read")
      ? [
          {
            label: t("lowStock"),
            value: String(data.lowStockCount),
            href: "/dashboard/inventory",
          },
        ]
      : []),
    ...(can("hisab.read")
      ? [
          {
            label: t("courierMoney"),
            value: formatMoney(data.courierHoldingPaisa),
            href: "/dashboard/reconciliation",
          },
        ]
      : []),
  ];
  const attention = [
    canReadOrders && (onHold.data ?? 0) > 0
      ? {
          label: t("onHoldShipments"),
          count: onHold.data ?? 0,
          href: "/dashboard/shipments?status=ON_HOLD",
        }
      : null,
    can("order.read") && data.today.pendingConfirmations > 0
      ? {
          label: t("pendingConfirmations"),
          count: data.today.pendingConfirmations,
          href: "/dashboard/orders?status=PENDING",
        }
      : null,
    can("inbox.read") && data.inbox.needsHuman > 0
      ? {
          label: t("needsHuman"),
          count: data.inbox.needsHuman,
          href: "/dashboard/inbox",
        }
      : null,
    can("product.read") && data.lowStockCount > 0
      ? {
          label: t("lowStock"),
          count: data.lowStockCount,
          href: "/dashboard/inventory",
        }
      : null,
    can("order.read") && data.today.toShip > 0
      ? {
          label: t("toShip"),
          count: data.today.toShip,
          href: "/dashboard/shipments",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  const usage = data.usage.filter((feature) => feature.type === "LIMIT");
  const checklistRaw =
    data.onboarding.setupChecklist && data.onboarding.setupChecklist.length > 0
      ? data.onboarding.setupChecklist
      : [
          { key: "profile_details", done: false, href: "/dashboard/profile" },
          { key: "shop_details", done: false, href: "/dashboard/settings" },
          { key: "two_factor", done: false, href: "/dashboard/profile" },
          { key: "facebook_page", done: false, href: "/dashboard/channels" },
          { key: "whatsapp_connected", done: false, href: "/dashboard/channels" },
          { key: "product_added", done: false, href: "/dashboard/products/new" },
          { key: "ai_business_info", done: false, href: "/dashboard/ai" },
        ];

  const checklistItems = checklistRaw.map((item) => {
    const meta = checklistConfig[item.key] ?? {
      titleKey: "checklistProfileTitle",
      descKey: "checklistProfileDesc",
      defaultHref: item.href,
    };
    return {
      ...item,
      title: t(meta.titleKey as never),
      desc: t(meta.descKey as never),
      href: item.href || meta.defaultHref,
    };
  });

  const completedCount = checklistItems.filter((i) => i.done).length;
  const totalCount = checklistItems.length;
  const isAllCompleted = completedCount === totalCount;
  const progressPercent = Math.round(
    (completedCount / Math.max(1, totalCount)) * 100,
  );

  return (
    <div className="space-y-7">
      <PageHeader title={t("title")} description={t("description")} />

      <section
        aria-label={t("today")}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="min-h-24 rounded-md border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 break-words text-xl font-semibold tabular-nums">
              {metric.value}
            </p>
          </Link>
        ))}
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <div className="space-y-7">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("checklistTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("checklistCompleted", {
                      done: completedCount,
                      total: totalCount,
                    })}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isAllCompleted
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {isAllCompleted
                  ? t("checklistStatusReady")
                  : t("checklistStatusInProgress")}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        item.done
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>
                      {item.done
                        ? t("checklistViewAction")
                        : t("checklistSetupAction")}
                    </span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              {t("checklistNote")}
            </div>
          </section>

          {can("billing.read") ? (
            <section className="border-y py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{t("usageTitle")}</h2>
                <Link
                  href="/dashboard/billing"
                  className="text-sm font-medium text-primary"
                >
                  {t("viewPlans")}
                </Link>
              </div>
              {usage.length ? (
                <div className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-2">
                  {usage.slice(0, 6).map((feature) => {
                    const used = feature.used ?? 0;
                    const limit = feature.limit ?? 0;
                    const percentage = feature.unlimited
                      ? 0
                      : Math.min(100, (used / Math.max(1, limit)) * 100);
                    return (
                      <div key={feature.key}>
                        <div className="flex justify-between gap-3 text-sm">
                          <span>
                            {tStep8(`features.${feature.key}` as never)}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {feature.unlimited
                              ? t("unlimited")
                              : t("usedOf", { used, limit })}
                          </span>
                        </div>
                        {!feature.unlimited ? (
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("noUsage")}
                </p>
              )}
            </section>
          ) : null}

          {can("order.read") ? (
            <section className="border-y py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{t("recentOrders")}</h2>
                <Link
                  href="/dashboard/orders"
                  className="text-sm font-medium text-primary"
                >
                  {t("viewAllOrders")}
                </Link>
              </div>
              {data.recentOrders.length ? (
                <ul className="mt-3 divide-y">
                  {data.recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="flex min-h-14 items-center justify-between gap-3 py-2 hover:text-primary"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {order.orderNumber} · {order.customerName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(`statuses.${statusKeys[order.status]}`)}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatMoney(order.totalPaisa)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  <EmptyState title={t("noRecentOrders")} />
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-7">
          {attention.length ? (
            <section className="border-y py-5">
              <h2 className="font-semibold">{t("needsAttention")}</h2>
              <ul className="mt-3 divide-y">
                {attention.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm hover:text-primary"
                    >
                      <span>{item.label}</span>
                      <span className="tabular-nums">
                        {item.count} <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="border-y py-5">
            <h2 className="font-semibold">{t("quickActions")}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {can("order.write") ? (
                <QuickAction
                  href="/dashboard/orders/new"
                  label={t("newOrder")}
                  icon={<PackagePlus size={17} />}
                />
              ) : null}
              {can("inbox.read") ? (
                <QuickAction
                  href="/dashboard/inbox"
                  label={t("openInbox")}
                  icon={<MessageSquare size={17} />}
                />
              ) : null}
              {can("hisab.read") ? (
                <QuickAction
                  href="/dashboard/hisab"
                  label={t("openLedger")}
                  icon={<BookOpen size={17} />}
                />
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  );
}
