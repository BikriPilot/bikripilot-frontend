"use client";

import { Check, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { BillingCycle } from "@/types/billing";
import type { PublicPlan } from "@/types/plan";

interface PlanPickerProps {
  plans: PublicPlan[];
  cycle: BillingCycle;
  currentPlanKey: string;
  currentCycle: BillingCycle;
  disabled?: boolean;
  onCycleChange: (cycle: BillingCycle) => void;
  onChoose: (plan: PublicPlan) => void;
}

export function PlanPicker({
  plans,
  cycle,
  currentPlanKey,
  currentCycle,
  disabled = false,
  onCycleChange,
  onChoose,
}: PlanPickerProps) {
  const t = useTranslations("billing");
  const locale = useLocale();

  return (
    <section className="space-y-4" aria-labelledby="billing-plans-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="billing-plans-title" className="text-lg font-semibold">
            {t("plansTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("plansDescription")}
          </p>
        </div>
        <div
          className="inline-flex min-h-11 rounded-lg border bg-card p-1"
          role="group"
          aria-label={t("billingCycle")}
        >
          {(["MONTHLY", "YEARLY"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={cycle === value}
              onClick={() => onCycleChange(value)}
              className={`min-h-9 rounded-md px-3 text-sm ${cycle === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t(`cycles.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const price =
            cycle === "MONTHLY"
              ? plan.priceMonthlyPaisa
              : plan.priceYearlyPaisa;
          const isCurrent =
            plan.key === currentPlanKey && cycle === currentCycle;
          return (
            <article
              key={plan.id}
              className={`flex min-w-0 flex-col rounded-xl border bg-card p-4 ${plan.isHighlighted ? "border-primary/60" : ""}`}
            >
              <div className="flex min-h-7 items-start justify-between gap-2">
                <h3 className="font-semibold">
                  {(locale === "bn" ? plan.nameBn : plan.nameEn) ?? plan.nameEn}
                </h3>
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-xs text-success">
                    {t("currentPlan")}
                  </span>
                ) : plan.isHighlighted ? (
                  <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs text-primary">
                    {t("popular")}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums">
                {formatMoney(price)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {t(`priceSuffix.${cycle}`)}
                </span>
              </p>
              {plan.descriptionEn || plan.descriptionBn ? (
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                  {(locale === "bn"
                    ? plan.descriptionBn
                    : plan.descriptionEn) ?? plan.descriptionEn}
                </p>
              ) : (
                <div className="min-h-10" />
              )}
              <ul className="my-4 grid gap-2 border-t pt-4 text-sm">
                {plan.features.slice(0, 5).map((feature) => (
                  <li
                    key={feature.key}
                    className="flex min-w-0 items-start gap-2"
                  >
                    {feature.enabled ? (
                      <Check
                        className="mt-0.5 shrink-0 text-success"
                        size={16}
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        className="mt-0.5 shrink-0 text-muted-foreground"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                    <span className="wrap-break-word">
                      {(locale === "bn" ? feature.nameBn : feature.nameEn) ??
                        feature.nameEn}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={disabled || isCurrent}
                onClick={() => onChoose(plan)}
                className="mt-auto min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCurrent ? t("currentPlan") : t("choosePlan")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
