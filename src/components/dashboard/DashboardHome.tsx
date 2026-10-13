"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Mail,
  MessageSquare,
  PackagePlus,
  RefreshCw,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCardsSkeleton } from "@/components/common/skeletons";
import {
  useDashboardOnHoldCount,
  useDashboardSummary,
} from "@/hooks/queries/useAnalytics";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth.api";
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
  const user = useAuthStore((state) => state.user);
  const query = useDashboardSummary();
  const { can } = useCurrentShop();
  const canReadOrders = can("order.read");
  const onHold = useDashboardOnHoldCount(canReadOrders);

  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    try {
      await authApi.resendVerification();
      toast.success(t("verificationSent"));
      setResendCooldown(60);
    } catch {
      toast.error(tStep8("genericError"));
    } finally {
      setResending(false);
    }
  };

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
        error={query.error || (canReadOrders ? onHold.error : undefined)}
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
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          user?.emailVerified ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>{t("emailVerifiedBadge")}</span>
            </div>
          ) : null
        }
      />

      {user && !user.emailVerified && (
        <section
          aria-label="Email verification"
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                {t("emailVerifyTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {t("emailVerifyBanner", { email: user.email })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              disabled={resending || resendCooldown > 0}
              onClick={handleResend}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {resending ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>
                {resendCooldown > 0
                  ? t("resendCooldown", { seconds: resendCooldown })
                  : t("resendVerification")}
              </span>
            </button>
          </div>
        </section>
      )}

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

      {/* Row 1: Plan usage & Quick actions side-by-side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plan Usage Card */}
        {can("billing.read") ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-foreground">{t("usageTitle")}</h2>
                <Link
                  href="/dashboard/billing"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("viewPlans")} →
                </Link>
              </div>
              {usage.length ? (
                <div className="mt-4 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                  {usage.slice(0, 6).map((feature) => {
                    const used = feature.used ?? 0;
                    const limit = feature.limit ?? 0;
                    const percentage = feature.unlimited
                      ? 0
                      : Math.min(100, (used / Math.max(1, limit)) * 100);
                    return (
                      <div key={feature.key} className="space-y-1">
                        <div className="flex justify-between gap-2 text-xs">
                          <span className="font-medium text-foreground truncate">
                            {tStep8(`features.${feature.key}` as never)}
                          </span>
                          <span className="shrink-0 text-muted-foreground tabular-nums">
                            {feature.unlimited
                              ? t("unlimited")
                              : t("usedOf", { used, limit })}
                          </span>
                        </div>
                        {!feature.unlimited ? (
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
                <p className="mt-4 text-xs text-muted-foreground">{t("noUsage")}</p>
              )}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-center">
            <p className="text-xs text-muted-foreground">{t("noUsage")}</p>
          </div>
        )}

        {/* Quick Actions & Attention Card */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground">{t("quickActions")}</h2>
              {attention.length ? (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {attention.length} {t("needsAttention")}
                </span>
              ) : null}
            </div>

            {/* Quick action buttons */}
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {can("order.write") ? (
                <QuickAction
                  href="/dashboard/orders/new"
                  label={t("newOrder")}
                  icon={<PackagePlus size={16} />}
                />
              ) : null}
              {can("inbox.read") ? (
                <QuickAction
                  href="/dashboard/inbox"
                  label={t("openInbox")}
                  icon={<MessageSquare size={16} />}
                />
              ) : null}
              <QuickAction
                href="/dashboard/ai"
                label={t("openAiAssistant")}
                icon={<Bot size={16} />}
              />
            </div>

            {/* Attention items if any */}
            {attention.length ? (
              <div className="mt-4 pt-3 border-t border-border/60">
                <ul className="divide-y divide-border/60">
                  {attention.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex min-h-10 items-center justify-between gap-3 py-1.5 text-xs hover:text-primary transition-colors"
                      >
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {item.count} <span aria-hidden="true">→</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Row 2: Checklist (Left) & Recent Orders (Right) with matched heights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        {/* Store & Business Preparation Checklist */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
                  <ClipboardCheck className="size-4" />
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
                      <AlertCircle className="size-4 shrink-0 text-rose-500" />
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
          </div>
        </section>

        {/* Recent Orders Card */}
        {can("order.read") ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-foreground">{t("recentOrders")}</h2>
                <Link
                  href="/dashboard/orders"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("viewAllOrders")} →
                </Link>
              </div>

              {data.recentOrders.length ? (
                <ul className="mt-2 divide-y divide-border flex-1">
                  {data.recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="flex min-h-12 items-center justify-between gap-3 py-2 hover:text-primary transition-colors"
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
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <EmptyState title={t("noRecentOrders")} />
                </div>
              )}
            </div>
          </section>
        ) : null}
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
