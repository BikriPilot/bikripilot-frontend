"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { DetailSkeleton } from "@/components/common/skeletons";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { reconciliationApi } from "@/lib/api/reconciliation.api";
import { formatDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { queryKeys } from "@/lib/queryKeys";
import { PayoutItemsTable } from "./PayoutItemsTable";

export default function PayoutDetail({ payoutId }: { payoutId: string }) {
  const t = useTranslations("reconciliation");
  const router = useRouter();
  const client = useQueryClient();
  const { shopId, can } = useCurrentShop();
  const [acceptMismatch, setAcceptMismatch] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const payout = useQuery({
    queryKey: queryKeys.payout(shopId, payoutId),
    queryFn: () => reconciliationApi.get(shopId!, payoutId),
    enabled: Boolean(shopId && payoutId),
  });
  const rematchMutation = useMutation({
    mutationFn: () => reconciliationApi.rematch(shopId!, payoutId),
  });
  const confirmMutation = useMutation({
    mutationFn: () =>
      reconciliationApi.confirm(shopId!, payoutId, acceptMismatch),
  });
  const deleteMutation = useMutation({
    mutationFn: () => reconciliationApi.remove(shopId!, payoutId),
  });

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: queryKeys.payout(shopId, payoutId),
      }),
      client.invalidateQueries({ queryKey: queryKeys.payouts(shopId) }),
      client.invalidateQueries({ queryKey: queryKeys.unpaidShipments(shopId) }),
      client.invalidateQueries({
        queryKey: queryKeys.reconciliationSummary(shopId),
      }),
      client.invalidateQueries({ queryKey: queryKeys.hisab(shopId ?? "") }),
    ]);
  };

  const rematch = async () => {
    try {
      await rematchMutation.mutateAsync();
      await refresh();
      toast.success(t("rematched"));
    } catch {
      toast.error(t("rematchError"));
    }
  };
  const confirm = async () => {
    try {
      await confirmMutation.mutateAsync();
      await refresh();
      toast.success(t("confirmed"));
    } catch {
      toast.error(t("confirmError"));
    }
  };
  const remove = async () => {
    try {
      await deleteMutation.mutateAsync();
      await refresh();
      router.push("/dashboard/reconciliation");
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  if (payout.isPending) return <DetailSkeleton />;
  if (payout.isError || !payout.data)
    return (
      <div className="p-4 md:p-6">
        <ErrorState onRetry={() => void payout.refetch()} />
      </div>
    );
  const data = payout.data;
  const confirmed = data.status === "CONFIRMED";
  const mismatch = data.status === "MISMATCH";
  const canManage = can("reconciliation.manage");
  const busy =
    rematchMutation.isPending ||
    confirmMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={data.reference || data.courierConnection?.name || data.provider}
        description={`${data.courierConnection?.name ?? data.provider} · ${formatDate(data.payoutDate)}`}
        action={
          <Link
            href="/dashboard/reconciliation"
            className="inline-flex min-h-10 items-center gap-2 border px-3 text-sm hover:bg-muted"
          >
            <ArrowLeft size={16} />
            {t("back")}
          </Link>
        }
      />

      <section className="grid gap-3 border-y py-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={t("statusLabel")} value={t(`status.${data.status}`)} />
        <Metric
          label={t("received")}
          value={formatMoney(data.receivedAmountPaisa)}
        />
        <Metric
          label={t("expected")}
          value={formatMoney(data.expectedAmountPaisa)}
        />
        <Metric
          label={t("difference")}
          value={formatMoney(data.differencePaisa)}
        />
        <Metric label={t("destination")} value={data.moneyAccount.name} />
        <Metric
          label={t("parcelCount", { count: data.itemCount })}
          value={data.reference ?? "-"}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          {t("parcelCount", { count: data.itemCount })}
        </h2>
        <PayoutItemsTable items={data.items ?? []} />
      </section>

      {!confirmed && canManage ? (
        <section className="flex flex-col gap-4 border-t pt-5">
          {mismatch ? (
            <div className="space-y-3">
              <p className="text-sm text-danger">{t("mismatchWarning")}</p>
              <label className="flex min-h-11 items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={acceptMismatch}
                  onChange={(event) => setAcceptMismatch(event.target.checked)}
                  className="mt-1 size-4 accent-primary"
                />
                <span>{t("acceptDifference")}</span>
              </label>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void rematch()}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 border px-3 text-sm hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {t("rematch")}
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy || (mismatch && !acceptMismatch)}
              className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Check size={16} />
              {t("confirmPayout")}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 border border-danger/40 px-3 text-sm text-danger hover:bg-danger-soft disabled:opacity-50"
            >
              <Trash2 size={16} />
              {t("delete")}
            </button>
          </div>
        </section>
      ) : null}

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="payout-delete-title"
        >
          <div className="w-full max-w-md space-y-4 border bg-card p-5 shadow-lg">
            <h2 id="payout-delete-title" className="font-semibold">
              {t("delete")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("deletePrompt")}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="min-h-10 border px-3 text-sm"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void remove()}
                disabled={busy}
                className="min-h-10 bg-danger px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}
