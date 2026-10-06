"use client";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { CardListSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/PageStates";
import { useEntitlements } from "@/hooks/useEntitlements";
export default function BillingPage() {
  const t = useTranslations("step8");
  const query = useEntitlements();
  if (query.isPending) return <CardListSkeleton rows={4} />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const data = query.data;
  const usage = Object.values(data.features).filter(
    (feature) => feature.type === "LIMIT",
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billingTitle")}
        description={t("billingDescription")}
      />
      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("currentPlan")}</p>
            <h2 className="mt-1 text-2xl font-semibold">{data.planNameEn}</h2>
          </div>
          <span className="rounded-full bg-success-soft px-3 py-1 text-sm text-success">
            {data.subscription.status}
          </span>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">{t("status")}</span>
            <p className="font-medium">{data.subscription.source}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("renews")}</span>
            <p className="font-medium">
              {data.subscription.currentPeriodEnd
                ? new Date(
                    data.subscription.currentPeriodEnd,
                  ).toLocaleDateString("en-GB")
                : t("freeLaunch")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("billing")}</span>
            <p className="font-medium">{data.subscription.billingCycle}</p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-primary/30 bg-primary-soft p-5">
        <h2 className="font-semibold">{t("freeLaunch")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("launchDescription")}
        </p>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">{t("usageTitle")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {usage.map((feature) => (
            <div key={feature.key}>
              <div className="flex justify-between text-sm">
                <span>{feature.key}</span>
                <span>
                  {feature.unlimited
                    ? t("unlimited")
                    : `${feature.used ?? 0} / ${feature.limit ?? 0}`}
                </span>
              </div>
              {!feature.unlimited ? (
                <div className="mt-2 h-2 rounded-full bg-muted">
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
      </section>
    </div>
  );
}
