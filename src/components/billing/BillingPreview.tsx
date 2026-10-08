"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import type { BillingPreviewDTO, CouponCheckDTO } from "@/types/billing";

interface BillingPreviewProps {
  preview: BillingPreviewDTO;
  couponCode: string;
  couponCheck: CouponCheckDTO | null;
  couponPending: boolean;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
}

export function BillingPreview({
  preview,
  couponCode,
  couponCheck,
  couponPending,
  onCouponCodeChange,
  onApplyCoupon,
}: BillingPreviewProps) {
  const t = useTranslations("billing");
  const locale = useLocale();
  const planName =
    (locale === "bn" ? preview.plan.nameBn : preview.plan.nameEn) ??
    preview.plan.nameEn;

  return (
    <section
      className="rounded-lg border bg-muted/30 p-4"
      aria-labelledby="billing-preview-title"
    >
      <h3 id="billing-preview-title" className="font-semibold">
        {t("preview.title")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`kinds.${preview.kind}`)} · {planName} ·{" "}
        {t(`cycles.${preview.billingCycle}`)}
      </p>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("preview.price")}</dt>
          <dd className="text-right tabular-nums">
            {formatMoney(preview.subtotalPaisa)}
          </dd>
        </div>
        {preview.discountPaisa > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("preview.discount")}</dt>
            <dd className="text-right tabular-nums">
              −{formatMoney(preview.discountPaisa)}
            </dd>
          </div>
        ) : null}
        {preview.creditPaisa > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("preview.credit")}</dt>
            <dd className="text-right tabular-nums">
              −{formatMoney(preview.creditPaisa)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t pt-3 font-semibold">
          <dt>{t("preview.total")}</dt>
          <dd className="text-right tabular-nums">
            {formatMoney(preview.totalPaisa)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("preview.starts")}</dt>
          <dd className="text-right">{formatDate(preview.periodStart)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("preview.ends")}</dt>
          <dd className="text-right">{formatDate(preview.periodEnd)}</dd>
        </div>
      </dl>
      {preview.creditPaisa > 0 && preview.currentPlan ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("preview.creditMessage", {
            amount: formatMoney(preview.creditPaisa),
            plan:
              (locale === "bn"
                ? preview.currentPlan.nameBn
                : preview.currentPlan.nameEn) ?? preview.currentPlan.nameEn,
          })}
        </p>
      ) : null}

      {preview.kind !== "DOWNGRADE" ? (
        <div className="mt-4 border-t pt-4">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>{t("coupon.label")}</span>
            <span className="flex flex-col gap-2 sm:flex-row">
              <input
                value={couponCode}
                onChange={(event) =>
                  onCouponCodeChange(event.currentTarget.value.toUpperCase())
                }
                maxLength={100}
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-lg border bg-card px-3 text-base outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={!couponCode.trim() || couponPending}
                className="min-h-11 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
              >
                {couponPending ? t("checking") : t("coupon.apply")}
              </button>
            </span>
          </label>
          {couponCheck ? (
            <p
              role="status"
              className={`mt-2 text-sm ${couponCheck.valid ? "text-success" : "text-danger"}`}
            >
              {couponCheck.valid
                ? t("coupon.applied", {
                    amount: formatMoney(couponCheck.discountPaisa),
                  })
                : t("coupon.invalid")}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
