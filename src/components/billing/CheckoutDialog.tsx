"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { BillingPreview } from "@/components/billing/BillingPreview";
import { ManualPaymentForm } from "@/components/billing/ManualPaymentForm";
import type {
  BillingPreviewDTO,
  BillingProvidersDTO,
  BillingSelection,
  CheckoutResultDTO,
  CouponCheckDTO,
  ManualPaymentInput,
  PaymentProvider,
} from "@/types/billing";

interface CheckoutDialogProps {
  open: boolean;
  preview: BillingPreviewDTO | null;
  selection: BillingSelection | null;
  providers: BillingProvidersDTO | null;
  checkoutResult: CheckoutResultDTO | null;
  couponCode: string;
  couponCheck: CouponCheckDTO | null;
  couponPending: boolean;
  busy: boolean;
  launchMode: boolean;
  manualSubmitted: boolean;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  onCheckout: (provider: PaymentProvider) => void;
  onScheduleDowngrade: () => void;
  onSubmitManual: (input: ManualPaymentInput) => void;
  onClose: () => void;
}

export function CheckoutDialog({
  open,
  preview,
  selection,
  providers,
  checkoutResult,
  couponCode,
  couponCheck,
  couponPending,
  busy,
  launchMode,
  manualSubmitted,
  onCouponCodeChange,
  onApplyCoupon,
  onCheckout,
  onScheduleDowngrade,
  onSubmitManual,
  onClose,
}: CheckoutDialogProps) {
  const t = useTranslations("billing");
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const enabledProviders =
    providers?.providers.filter((item) => item.enabled) ?? [];
  const selectedProvider =
    enabledProviders.find((item) => item.provider === provider)?.provider ??
    enabledProviders[0]?.provider ??
    null;

  if (!open || !preview || !selection) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-checkout-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border bg-background p-4 shadow-lg sm:rounded-xl sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="billing-checkout-title" className="text-lg font-semibold">
              {t("checkout.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("checkout.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="mt-5 grid gap-4">
          <BillingPreview
            preview={preview}
            couponCode={couponCode}
            couponCheck={couponCheck}
            couponPending={couponPending}
            onCouponCodeChange={onCouponCodeChange}
            onApplyCoupon={onApplyCoupon}
          />

          {checkoutResult?.manualInstructions ? (
            manualSubmitted ? (
              <div
                role="status"
                className="rounded-lg border border-success/40 bg-success-soft p-4 text-sm"
              >
                <p className="font-semibold">{t("manual.submittedTitle")}</p>
                <p className="mt-1">{t("manual.submittedBody")}</p>
              </div>
            ) : (
              <ManualPaymentForm
                instructions={checkoutResult.manualInstructions}
                isPending={busy}
                onSubmit={onSubmitManual}
              />
            )
          ) : checkoutResult?.invoice.status === "PAID" ? (
            <div
              role="status"
              className="rounded-lg border border-success/40 bg-success-soft p-4 text-sm"
            >
              <p className="font-semibold">{t("paymentReturn.paidTitle")}</p>
              <p className="mt-1">{t("paymentReturn.paidBody")}</p>
            </div>
          ) : preview.kind === "DOWNGRADE" ? (
            <button
              type="button"
              onClick={onScheduleDowngrade}
              disabled={busy}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? t("checking") : t("scheduleDowngrade")}
            </button>
          ) : (
            <fieldset className="grid gap-2" disabled={busy || launchMode}>
              <legend className="text-sm font-semibold">
                {t("checkout.provider")}
              </legend>
              {enabledProviders.length ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {enabledProviders.map((item) => (
                    <label
                      key={item.provider}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${selectedProvider === item.provider ? "border-primary bg-primary-soft" : "bg-card"}`}
                    >
                      <input
                        type="radio"
                        name="billing-provider"
                        value={item.provider}
                        checked={selectedProvider === item.provider}
                        onChange={() => setProvider(item.provider)}
                      />
                      {t(`providers.${item.provider}`)}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  {t("checkout.noProviders")}
                </p>
              )}
              {launchMode ? (
                <p className="text-sm text-muted-foreground">
                  {t("launch.checkoutDisabled")}
                </p>
              ) : null}
            </fieldset>
          )}

          {!checkoutResult?.manualInstructions &&
          checkoutResult?.invoice.status !== "PAID" &&
          preview.kind !== "DOWNGRADE" ? (
            <button
              type="button"
              onClick={() => selectedProvider && onCheckout(selectedProvider)}
              disabled={
                busy ||
                launchMode ||
                !selectedProvider ||
                !enabledProviders.length
              }
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? t("checking") : t("checkout.continue")}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
