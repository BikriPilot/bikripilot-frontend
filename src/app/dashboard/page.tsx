"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState, EmptyState } from "@/components/common/PageStates";
import { StatCardsSkeleton } from "@/components/common/skeletons";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useEntitlements } from "@/hooks/useEntitlements";
export default function DashboardPage() {
  const t = useTranslations("step8");
  const { shopId } = useCurrentShop();
  const onboarding = useQuery({
    queryKey: ["onboarding", shopId],
    queryFn: () => shopsApi.onboarding(shopId!),
    enabled: Boolean(shopId),
  });
  const entitlements = useEntitlements();
  if (onboarding.isPending || entitlements.isPending)
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("dashboard")}
          description={t("dashboardDescription")}
        />
        <StatCardsSkeleton count={4} />
      </div>
    );
  if (onboarding.isError || entitlements.isError)
    return (
      <ErrorState
        onRetry={() => {
          void onboarding.refetch();
          void entitlements.refetch();
        }}
      />
    );
  const steps = onboarding.data?.steps.filter((step) => !step.done) ?? [];
  const usage = Object.values(entitlements.data?.features ?? {}).filter(
    (feature) => feature.type === "LIMIT",
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard")}
        description={t("dashboardDescription")}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={t("ordersToday")} value="0" />
        <Metric label={t("pending")} value="0" />
        <Metric label={t("toShip")} value="0" />
        <Metric label={t("courierMoney")} value="৳0" />
      </div>
      {!onboarding.data?.completed && !onboarding.data?.dismissed ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-semibold">{t("setupTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("setupDescription")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((step) => (
              <span
                key={step.key}
                className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary"
              >
                {step.key.replaceAll("_", " ")}
              </span>
            ))}
          </div>
          <Link
            href="/onboarding"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("openOnboarding")}
          </Link>
        </section>
      ) : null}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("usageTitle")}</h2>
          <Link
            href="/dashboard/billing"
            className="text-sm font-semibold text-primary"
          >
            {t("seePlans")}
          </Link>
        </div>
        {usage.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={t("noUsage")} />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {usage.slice(0, 6).map((feature) => (
              <div key={feature.key}>
                <div className="flex justify-between text-sm">
                  <span>
                    {t(`features.${feature.key}` as never) || feature.key}
                  </span>
                  <span className="text-muted-foreground">
                    {feature.unlimited
                      ? t("unlimited")
                      : `${feature.used ?? 0} / ${feature.limit ?? 0}`}
                  </span>
                </div>
                {!feature.unlimited ? (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, ((feature.used ?? 0) / Math.max(1, feature.limit ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
