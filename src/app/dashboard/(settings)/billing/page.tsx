"use client";

import { Suspense, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { PaymentStatusPoller } from "@/components/billing/PaymentStatusPoller";
import { PlanPicker } from "@/components/billing/PlanPicker";
import { RenewalBanner } from "@/components/billing/RenewalBanner";
import { ErrorState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { CardListSkeleton } from "@/components/common/skeletons";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useEntitlements } from "@/hooks/useEntitlements";
import { billingApi } from "@/lib/api/billing.api";
import { formatDate } from "@/lib/date";
import { queryKeys } from "@/lib/queryKeys";
import type { EntitlementsDTO } from "@/types/entitlement";
import type {
  BillingCycle,
  BillingPreviewDTO,
  BillingSelection,
  CheckoutResultDTO,
  CouponCheckDTO,
  ManualPaymentInput,
  PaymentProvider,
} from "@/types/billing";
import type { PublicPlan } from "@/types/plan";

const pendingPaymentStorageKey = "bk_pending_billing_payment";

function BillingContent() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { shopId, can } = useCurrentShop();
  const entitlements = useEntitlements();
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const [selection, setSelection] = useState<BillingSelection | null>(null);
  const [preview, setPreview] = useState<BillingPreviewDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] =
    useState<CheckoutResultDTO | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponCheck, setCouponCheck] = useState<CouponCheckDTO | null>(null);
  const [manualSubmitted, setManualSubmitted] = useState(false);
  const [returnPaymentId, setReturnPaymentId] = useState<string | null>(null);
  const [returnInvoiceId, setReturnInvoiceId] = useState<string | null>(null);
  const paymentStatus = searchParams.get("payment");
  const urlInvoiceId = searchParams.get("invoice");
  const paymentIdParam = searchParams.get("paymentId");

  const plansQuery = useQuery({
    queryKey: queryKeys.billingPlans,
    queryFn: billingApi.plans,
    staleTime: 300_000,
  });
  const providersQuery = useQuery({
    queryKey: queryKeys.billingProviders,
    queryFn: billingApi.providers,
    staleTime: 60_000,
  });
  const invoicesQuery = useQuery({
    queryKey: queryKeys.billingInvoices(shopId),
    queryFn: () => billingApi.invoices(shopId!),
    enabled: Boolean(shopId),
  });
  const subscription = entitlements.data?.subscription;
  const renewalInvoiceId = subscription?.openRenewalInvoiceId ?? null;
  const invoiceToFetch = urlInvoiceId ?? renewalInvoiceId;
  const linkedInvoiceQuery = useQuery({
    queryKey: queryKeys.billingInvoice(shopId, invoiceToFetch),
    queryFn: () => billingApi.invoice(shopId!, invoiceToFetch!),
    enabled: Boolean(shopId && invoiceToFetch),
  });

  const refreshBilling = async () => {
    if (!shopId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["entitlements", shopId] }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.billingInvoices(shopId),
      }),
    ]);
  };
  const setSubscription = (updated: EntitlementsDTO["subscription"]) => {
    if (!shopId) return;
    queryClient.setQueryData<EntitlementsDTO>(
      ["entitlements", shopId],
      (current) => (current ? { ...current, subscription: updated } : current),
    );
  };

  const previewMutation = useMutation({
    mutationFn: (input: BillingSelection) => billingApi.preview(shopId!, input),
    onSuccess: (result, input) => {
      setSelection(input);
      setPreview(result);
      setCheckoutResult(null);
      setManualSubmitted(false);
      if (!input.couponCode) setCouponCheck(null);
      setCouponCode(input.couponCode ?? "");
      setDialogOpen(true);
    },
    onError: () => toast.error(t("actionError")),
  });
  const couponMutation = useMutation({
    mutationFn: (input: {
      code: string;
      planKey: string;
      billingCycle: BillingCycle;
    }) => billingApi.checkCoupon(shopId!, input),
    onSuccess: (result) => {
      setCouponCheck(result);
      if (!result.valid || !selection) return;
      const updated = { ...selection, couponCode: result.code };
      setSelection(updated);
      previewMutation.mutate(updated);
    },
    onError: () => toast.error(t("actionError")),
  });
  const checkoutMutation = useMutation({
    mutationFn: (provider: PaymentProvider) =>
      billingApi.checkout(shopId!, { ...selection!, provider }),
    onSuccess: async (result) => {
      setCheckoutResult(result);
      await refreshBilling();
      if (result.invoice.status === "PAID") return;
      if (result.redirectUrl) {
        try {
          sessionStorage.setItem(
            pendingPaymentStorageKey,
            JSON.stringify({
              invoiceId: result.invoice.id,
              paymentId: result.paymentId,
            }),
          );
        } catch {
          setReturnInvoiceId(result.invoice.id);
          setReturnPaymentId(result.paymentId);
        }
        try {
          const redirect = new URL(result.redirectUrl);
          if (redirect.protocol !== "https:")
            throw new Error("Invalid payment URL");
          window.location.assign(redirect.toString());
        } catch {
          toast.error(t("actionError"));
        }
      }
    },
    onError: () => toast.error(t("actionError")),
  });
  const downgradeMutation = useMutation({
    mutationFn: () => billingApi.scheduleDowngrade(shopId!, selection!),
    onSuccess: async (updated) => {
      setSubscription(updated);
      await refreshBilling();
      setDialogOpen(false);
      toast.success(t("downgradeScheduled"));
    },
    onError: () => toast.error(t("actionError")),
  });
  const cancelDowngradeMutation = useMutation({
    mutationFn: () => billingApi.cancelDowngrade(shopId!),
    onSuccess: async (updated) => {
      setSubscription(updated);
      await refreshBilling();
      toast.success(t("downgradeCancelled"));
    },
    onError: () => toast.error(t("actionError")),
  });
  const autoRenewMutation = useMutation({
    mutationFn: (autoRenew: boolean) =>
      billingApi.setAutoRenew(shopId!, autoRenew),
    onSuccess: async (updated) => {
      setSubscription(updated);
      await refreshBilling();
      toast.success(t("settingsSaved"));
    },
    onError: () => toast.error(t("actionError")),
  });
  const cancellationMutation = useMutation({
    mutationFn: (cancel: boolean) =>
      billingApi.setCancelAtPeriodEnd(shopId!, cancel),
    onSuccess: async (updated) => {
      setSubscription(updated);
      await refreshBilling();
      toast.success(t("settingsSaved"));
    },
    onError: () => toast.error(t("actionError")),
  });
  const manualMutation = useMutation({
    mutationFn: (input: ManualPaymentInput) =>
      billingApi.submitManualPayment(shopId!, checkoutResult!.paymentId, input),
    onSuccess: async () => {
      setManualSubmitted(true);
      await refreshBilling();
      toast.success(t("manual.submittedTitle"));
    },
    onError: () => toast.error(t("actionError")),
  });

  useEffect(() => {
    if (!paymentStatus) return;
    const timeout = window.setTimeout(() => {
      if (paymentIdParam) setReturnPaymentId(paymentIdParam);
      if (urlInvoiceId) setReturnInvoiceId(urlInvoiceId);
      try {
        const stored = sessionStorage.getItem(pendingPaymentStorageKey);
        if (stored) {
          const pending = JSON.parse(stored) as {
            invoiceId?: string;
            paymentId?: string;
          };
          setReturnInvoiceId((current) => current ?? pending.invoiceId ?? null);
          setReturnPaymentId((current) => current ?? pending.paymentId ?? null);
        }
      } catch {
        setReturnInvoiceId((current) => current ?? null);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [paymentIdParam, paymentStatus, urlInvoiceId]);

  if (
    entitlements.isPending ||
    plansQuery.isPending ||
    providersQuery.isPending ||
    invoicesQuery.isPending
  )
    return <CardListSkeleton rows={5} />;
  if (
    entitlements.isError ||
    !entitlements.data ||
    plansQuery.isError ||
    !plansQuery.data ||
    providersQuery.isError ||
    !providersQuery.data ||
    invoicesQuery.isError ||
    !invoicesQuery.data
  )
    return (
      <ErrorState
        onRetry={() => {
          void entitlements.refetch();
          void plansQuery.refetch();
          void providersQuery.refetch();
          void invoicesQuery.refetch();
        }}
      />
    );

  const data = entitlements.data;
  const canManage = can("billing.manage");
  const usage = Object.values(data.features).filter(
    (feature) => feature.type === "LIMIT",
  );
  const isBusy =
    previewMutation.isPending ||
    couponMutation.isPending ||
    checkoutMutation.isPending ||
    downgradeMutation.isPending ||
    cancelDowngradeMutation.isPending ||
    autoRenewMutation.isPending ||
    cancellationMutation.isPending ||
    manualMutation.isPending;
  const statusLabel = (status: string) => t(`subscriptionStatuses.${status}`);
  const showReturnStatus =
    paymentStatus === "success" ||
    paymentStatus === "failed" ||
    paymentStatus === "cancelled";

  const choosePlan = (plan: PublicPlan) => {
    setCouponCode("");
    setCouponCheck(null);
    previewMutation.mutate({ planKey: plan.key, billingCycle: cycle });
  };
  const payRenewal = () => {
    const invoice = linkedInvoiceQuery.data;
    if (!invoice) return;
    previewMutation.mutate({
      planKey: invoice.plan.key,
      billingCycle: invoice.billingCycle,
    });
  };
  const applyCoupon = () => {
    if (!selection || !couponCode.trim()) return;
    couponMutation.mutate({
      code: couponCode.trim(),
      planKey: selection.planKey,
      billingCycle: selection.billingCycle,
    });
  };
  const submitCheckout = (provider: PaymentProvider) => {
    if (!canManage) return;
    checkoutMutation.mutate(provider);
  };
  const submitManual = (input: ManualPaymentInput) => {
    if (!canManage) return;
    manualMutation.mutate(input);
  };
  const setAutoRenew = (checked: boolean) => {
    if (canManage) autoRenewMutation.mutate(checked);
  };
  const setCancellation = (checked: boolean) => {
    if (!canManage) return;
    if (checked && !window.confirm(t("confirmCancel"))) return;
    cancellationMutation.mutate(checked);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setCheckoutResult(null);
    setManualSubmitted(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      {showReturnStatus && shopId ? (
        <PaymentStatusPoller
          shopId={shopId}
          status={paymentStatus!}
          paymentId={paymentIdParam ?? returnPaymentId}
          invoiceId={urlInvoiceId ?? returnInvoiceId}
        />
      ) : null}

      {data.isLaunchMode ? (
        <section className="rounded-xl border border-primary/30 bg-primary-soft p-4">
          <h2 className="font-semibold">{t("launch.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("launch.description")}
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("currentPlan")}
              </p>
              <h2 className="mt-1 wrap-break-word text-xl font-semibold">
                {(locale === "bn"
                  ? data.subscription.plan.nameBn
                  : data.subscription.plan.nameEn) ??
                  data.subscription.plan.nameEn}
              </h2>
            </div>
            <span className="rounded-full bg-success-soft px-3 py-1 text-sm text-success">
              {statusLabel(data.subscription.status)}
            </span>
          </div>
          <dl className="mt-5 grid gap-4 border-t pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">
                {t("subscription.source")}
              </dt>
              <dd className="mt-1 font-medium">
                {t(`sources.${data.subscription.source}`)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("subscription.periodEnd")}
              </dt>
              <dd className="mt-1 font-medium">
                {data.subscription.currentPeriodEnd
                  ? formatDate(data.subscription.currentPeriodEnd)
                  : t("subscription.noEndDate")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("subscription.billingCycle")}
              </dt>
              <dd className="mt-1 font-medium">
                {t(`cycles.${data.subscription.billingCycle}`)}
              </dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
              <span>{t("subscription.autoRenew")}</span>
              <input
                type="checkbox"
                role="switch"
                checked={data.subscription.autoRenew}
                disabled={!canManage || autoRenewMutation.isPending}
                onChange={(event) => setAutoRenew(event.currentTarget.checked)}
                className="size-5 accent-primary"
              />
            </label>
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
              <span>{t("subscription.cancelAtEnd")}</span>
              <input
                type="checkbox"
                role="switch"
                checked={data.subscription.cancelAtPeriodEnd}
                disabled={!canManage || cancellationMutation.isPending}
                onChange={(event) =>
                  setCancellation(event.currentTarget.checked)
                }
                className="size-5 accent-primary"
              />
            </label>
          </div>
          {data.subscription.pendingPlan ? (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning-soft p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                {t("subscription.pendingDowngrade", {
                  plan:
                    (locale === "bn"
                      ? data.subscription.pendingPlan.nameBn
                      : data.subscription.pendingPlan.nameEn) ??
                    data.subscription.pendingPlan.nameEn,
                  date: data.subscription.currentPeriodEnd
                    ? formatDate(data.subscription.currentPeriodEnd)
                    : t("subscription.noEndDate"),
                })}
              </p>
              <button
                type="button"
                disabled={!canManage || cancelDowngradeMutation.isPending}
                onClick={() => cancelDowngradeMutation.mutate()}
                className="min-h-10 shrink-0 rounded-lg border bg-card px-3 text-sm font-medium disabled:opacity-50"
              >
                {t("subscription.keepPlan")}
              </button>
            </div>
          ) : null}
        </div>

        <section
          className="rounded-xl border bg-card p-4 sm:p-5"
          aria-labelledby="billing-usage-title"
        >
          <h2 id="billing-usage-title" className="font-semibold">
            {t("usage.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("usage.period", { period: data.period })}
          </p>
          <div className="mt-4 grid gap-4">
            {usage.map((feature) => {
              const planFeature = plansQuery.data
                .find((plan) => plan.key === data.planKey)
                ?.features.find((item) => item.key === feature.key);
              const used = feature.used ?? 0;
              const limit = feature.limit ?? 0;
              const percent = feature.unlimited
                ? 0
                : Math.min(100, (used / Math.max(1, limit)) * 100);
              return (
                <div key={feature.key}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="wrap-break-word">
                      {(locale === "bn"
                        ? planFeature?.nameBn
                        : planFeature?.nameEn) ?? t(`features.${feature.key}`)}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {feature.unlimited
                        ? t("usage.unlimited")
                        : t("usage.usedOf", { used, limit })}
                    </span>
                  </div>
                  {!feature.unlimited ? (
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={t(`features.${feature.key}`)}
                      aria-valuemin={0}
                      aria-valuemax={limit}
                      aria-valuenow={Math.min(used, limit)}
                    >
                      <div
                        className={`h-full rounded-full ${percent >= 100 ? "bg-danger" : percent >= 80 ? "bg-warning" : "bg-primary"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </section>

      {renewalInvoiceId ? (
        <RenewalBanner
          invoiceId={renewalInvoiceId}
          invoice={linkedInvoiceQuery.data}
          pending={linkedInvoiceQuery.isPending}
          onPay={payRenewal}
        />
      ) : null}

      <PlanPicker
        plans={plansQuery.data}
        cycle={cycle}
        currentPlanKey={data.planKey}
        currentCycle={data.subscription.billingCycle}
        disabled={!canManage || previewMutation.isPending}
        onCycleChange={setCycle}
        onChoose={choosePlan}
      />

      <section className="space-y-3" aria-labelledby="billing-invoices-title">
        <div>
          <h2 id="billing-invoices-title" className="text-lg font-semibold">
            {t("invoice.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("invoice.description")}
          </p>
        </div>
        <InvoiceTable invoices={invoicesQuery.data.items} />
      </section>

      {shopId ? (
        <CheckoutDialog
          open={dialogOpen}
          preview={preview}
          selection={selection}
          providers={providersQuery.data}
          checkoutResult={checkoutResult}
          couponCode={couponCode}
          couponCheck={couponCheck}
          couponPending={couponMutation.isPending}
          busy={isBusy}
          launchMode={data.isLaunchMode}
          manualSubmitted={manualSubmitted}
          onCouponCodeChange={setCouponCode}
          onApplyCoupon={applyCoupon}
          onCheckout={submitCheckout}
          onScheduleDowngrade={() => downgradeMutation.mutate()}
          onSubmitManual={submitManual}
          onClose={closeDialog}
        />
      ) : null}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<CardListSkeleton rows={5} />}>
      <BillingContent />
    </Suspense>
  );
}
