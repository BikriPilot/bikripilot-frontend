"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleDashed, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { billingApi } from "@/lib/api/billing.api";
import { queryKeys } from "@/lib/queryKeys";

interface PaymentStatusPollerProps {
  shopId: string;
  status: string;
  paymentId: string | null;
  invoiceId: string | null;
}

export function PaymentStatusPoller({
  shopId,
  status,
  paymentId,
  invoiceId,
}: PaymentStatusPollerProps) {
  const t = useTranslations("billing");
  const queryClient = useQueryClient();
  const [timedOut, setTimedOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const invoiceQuery = useQuery({
    queryKey: queryKeys.billingInvoice(shopId, invoiceId),
    queryFn: () => billingApi.invoice(shopId, invoiceId!),
    enabled: Boolean(invoiceId),
    refetchInterval: (query) => {
      if (timedOut) return false;
      return query.state.data?.status === "PENDING" ? 3_000 : false;
    },
  });
  const paid = invoiceQuery.data?.status === "PAID";

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 60_000);
    return () => window.clearTimeout(timeout);
  }, [invoiceId]);

  useEffect(() => {
    if (!paid) return;
    void queryClient.invalidateQueries({ queryKey: ["entitlements", shopId] });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.billingInvoices(shopId),
    });
    try {
      sessionStorage.removeItem("bk_pending_billing_payment");
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
  }, [paid, queryClient, shopId]);

  const checkAgain = async () => {
    setChecking(true);
    try {
      if (paymentId) await billingApi.recheckPayment(shopId, paymentId);
      await Promise.all([
        invoiceId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.billingInvoice(shopId, invoiceId),
            })
          : Promise.resolve(),
        queryClient.invalidateQueries({
          queryKey: queryKeys.billingInvoices(shopId),
        }),
        queryClient.invalidateQueries({ queryKey: ["entitlements", shopId] }),
      ]);
    } catch {
      toast.error(t("actionError"));
    } finally {
      setChecking(false);
    }
  };

  if (paid) {
    return (
      <section
        role="status"
        className="flex items-start gap-3 rounded-xl border border-success/40 bg-success-soft p-4"
      >
        <CircleCheck
          className="mt-0.5 shrink-0 text-success"
          size={20}
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">{t("paymentReturn.paidTitle")}</h2>
          <p className="mt-1 text-sm">{t("paymentReturn.paidBody")}</p>
        </div>
      </section>
    );
  }

  const failed = status === "failed" || status === "cancelled";
  return (
    <section role="status" className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {failed ? (
            <RefreshCw
              className="mt-0.5 shrink-0 text-warning"
              size={19}
              aria-hidden="true"
            />
          ) : (
            <CircleDashed
              className="mt-0.5 shrink-0 animate-pulse text-primary"
              size={19}
              aria-hidden="true"
            />
          )}
          <div>
            <h2 className="font-semibold">
              {failed
                ? t("paymentReturn.pendingTitle")
                : t("paymentReturn.confirmingTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {timedOut || failed || !invoiceId
                ? t("paymentReturn.pendingBody")
                : t("paymentReturn.confirmingBody")}
            </p>
            {invoiceQuery.isError ? (
              <p className="mt-2 text-sm text-danger">
                {t("paymentReturn.statusError")}
              </p>
            ) : null}
          </div>
        </div>
        {timedOut || failed || !invoiceId ? (
          <button
            type="button"
            onClick={() => void checkAgain()}
            disabled={checking}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} aria-hidden="true" />
            {checking ? t("checking") : t("paymentReturn.checkAgain")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
