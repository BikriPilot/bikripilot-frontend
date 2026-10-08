"use client";

import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useState } from "react";
import type { PublicPlan, PublicPlanFeature } from "@/types/plan";
import { formatMoney } from "@/lib/money";

export function PricingComparison({
  plans,
  compact = false,
}: {
  plans: PublicPlan[];
  compact?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("pricing");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const features = plans
    .flatMap((plan) => plan.features)
    .filter(
      (feature, index, all) =>
        all.findIndex((item) => item.key === feature.key) === index,
    );
  const grouped = features.reduce<Record<string, PublicPlanFeature[]>>(
    (result, feature) => {
      (result[feature.group] ??= []).push(feature);
      return result;
    },
    {} as Record<string, PublicPlanFeature[]>,
  );

  return (
    <div className="mt-10 space-y-8">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border bg-card p-1" role="group">
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCycle(value)}
              className={`min-h-10 rounded-md px-4 text-sm font-semibold ${cycle === value ? "bg-primary-soft text-primary" : "text-muted-foreground"}`}
              aria-pressed={cycle === value}
            >
              {t(value)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border bg-card p-6 ${plan.isHighlighted ? "border-primary ring-2 ring-primary/15" : ""}`}
          >
            <h2 className="text-xl font-semibold">
              {locale === "bn" ? plan.nameBn || plan.nameEn : plan.nameEn}
            </h2>
            <p className="mt-2 min-h-12 text-sm text-muted-foreground">
              {locale === "bn"
                ? plan.descriptionBn || plan.descriptionEn
                : plan.descriptionEn || plan.descriptionBn}
            </p>
            <p className="mt-6 text-3xl font-semibold">
              {formatMoney(
                cycle === "monthly"
                  ? plan.priceMonthlyPaisa
                  : plan.priceYearlyPaisa,
              )}
              <span className="text-sm font-normal text-muted-foreground">
                {cycle === "monthly" ? t("perMonth") : t("perYear")}
              </span>
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("startFree")}
              <ArrowRight className="size-4" />
            </Link>
            {compact ? (
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features
                  .filter((feature) => feature.enabled)
                  .slice(0, 5)
                  .map((feature) => (
                    <li key={feature.key} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>
                        {locale === "bn"
                          ? feature.nameBn || feature.nameEn
                          : feature.nameEn}
                        {feature.unlimited
                          ? ` - ${t("unlimited")}`
                          : feature.limit !== null
                            ? ` - ${feature.limit}`
                            : ""}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-5 py-4 font-semibold">{t("feature")}</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-5 py-4 font-semibold">
                    {locale === "bn" ? plan.nameBn || plan.nameEn : plan.nameEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([group, groupFeatures]) => (
                <Fragment key={group}>
                  <tr className="border-b bg-muted/30">
                    <th
                      colSpan={plans.length + 1}
                      className="px-5 py-3 text-xs font-semibold text-primary"
                    >
                      {t(`groups.${group}`)}
                    </th>
                  </tr>
                  {groupFeatures.map((feature) => (
                    <tr key={feature.key} className="border-b last:border-0">
                      <td className="px-5 py-4 font-medium">
                        {locale === "bn"
                          ? feature.nameBn || feature.nameEn
                          : feature.nameEn}
                      </td>
                      {plans.map((plan) => {
                        const value = plan.features.find(
                          (item) => item.key === feature.key,
                        );
                        return (
                          <td
                            key={plan.id}
                            className="px-5 py-4 text-muted-foreground"
                          >
                            {!value?.enabled ? (
                              <Minus
                                className="size-4"
                                aria-label={t("notIncluded")}
                              />
                            ) : value.unlimited ? (
                              t("unlimited")
                            ) : value?.limit !== null &&
                              value?.limit !== undefined ? (
                              value.limit
                            ) : value?.enabled ? (
                              <Check
                                className="size-4 text-success"
                                aria-label={t("included")}
                              />
                            ) : (
                              <Minus
                                className="size-4"
                                aria-label={t("notIncluded")}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
