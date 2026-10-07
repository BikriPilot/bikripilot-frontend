"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState, ErrorState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { HisabSkeleton } from "@/components/common/skeletons";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useCouriers } from "@/hooks/queries/useCouriers";
import { hisabApi } from "@/lib/api/hisab.api";
import { reconciliationApi } from "@/lib/api/reconciliation.api";
import { formatDate } from "@/lib/date";
import { formatMoney, takaToPaisa } from "@/lib/money";
import { queryKeys } from "@/lib/queryKeys";
import type { ShipmentDTO } from "@/types/courier";
import type {
  PayoutCreateInput,
  PayoutImportInput,
  PayoutLineInput,
} from "@/types/reconciliation";
import { CourierMoneySummary } from "./CourierMoneySummary";
import { PayoutCsvImport } from "./PayoutCsvImport";
import {
  PayoutForm,
  PayoutMetadataFields,
  type PayoutMetadata,
} from "./PayoutForm";
import { PayoutTable } from "./PayoutTable";

const todayDhaka = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
};

const newMetadata = (): PayoutMetadata => ({
  courierConnectionId: "",
  payoutDate: todayDhaka(),
  receivedTaka: "",
  moneyAccountId: "",
  reference: "",
  note: "",
});

export default function ReconciliationPage() {
  const t = useTranslations("reconciliation");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { shopId, can } = useCurrentShop();
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [metadata, setMetadata] = useState<PayoutMetadata>(newMetadata);
  const connections = useCouriers();
  const accounts = useQuery({
    queryKey: [...queryKeys.hisab(shopId ?? ""), "accounts"],
    queryFn: () => hisabApi.accounts(shopId!),
    enabled: Boolean(shopId),
  });
  const summary = useQuery({
    queryKey: queryKeys.reconciliationSummary(shopId),
    queryFn: () => reconciliationApi.summary(shopId!),
    enabled: Boolean(shopId),
  });
  const unpaidQuery = useQuery({
    queryKey: queryKeys.unpaidShipments(shopId, { page: 1, limit: 10 }),
    queryFn: () => reconciliationApi.unpaid(shopId!, { page: 1, limit: 10 }),
    enabled: Boolean(shopId),
  });
  const payoutsQuery = useQuery({
    queryKey: queryKeys.payouts(shopId, { page: 1, limit: 20 }),
    queryFn: () => reconciliationApi.list(shopId!, { page: 1, limit: 20 }),
    enabled: Boolean(shopId),
  });
  const createMutation = useMutation({
    mutationFn: (input: PayoutCreateInput) =>
      reconciliationApi.create(shopId!, input),
  });
  const importMutation = useMutation({
    mutationFn: ({ input, file }: { input: PayoutImportInput; file: File }) =>
      reconciliationApi.importCsv(shopId!, input, file),
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.reconciliationSummary(shopId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.unpaidShipments(shopId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts(shopId) }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.hisab(shopId ?? ""),
      }),
    ]);
  };

  const buildMetadata = (): Omit<PayoutCreateInput, "items"> | null => {
    const connection = connections.data?.find(
      (item) => item.id === metadata.courierConnectionId && item.isActive,
    );
    if (
      !connection ||
      !metadata.moneyAccountId ||
      !metadata.payoutDate ||
      !/^\d+$/.test(metadata.receivedTaka)
    )
      return null;
    return {
      courierConnectionId: connection.id,
      provider: connection.provider,
      payoutDate: metadata.payoutDate,
      receivedAmountPaisa: takaToPaisa(metadata.receivedTaka),
      moneyAccountId: metadata.moneyAccountId,
      reference: metadata.reference.trim() || undefined,
      note: metadata.note.trim() || undefined,
    };
  };

  const submitManual = async (items: PayoutLineInput[]) => {
    const fields = buildMetadata();
    if (!fields) return toast.error(t("invalidAmount"));
    try {
      const payout = await createMutation.mutateAsync({ ...fields, items });
      await invalidate();
      toast.success(t("saved"));
      router.push(`/dashboard/reconciliation/${payout.id}`);
    } catch {
      toast.error(t("createError"));
    }
  };

  const submitCsv = async (file: File) => {
    const fields = buildMetadata();
    if (!fields) return toast.error(t("invalidAmount"));
    try {
      const payout = await importMutation.mutateAsync({ input: fields, file });
      await invalidate();
      toast.success(t("imported"));
      router.push(`/dashboard/reconciliation/${payout.id}`);
    } catch {
      toast.error(t("importError"));
    }
  };

  const queries = [summary, unpaidQuery, payoutsQuery, accounts, connections];
  if (queries.some((query) => query.isPending)) return <HisabSkeleton />;
  if (
    queries.some((query) => query.isError) ||
    !summary.data ||
    !unpaidQuery.data ||
    !payoutsQuery.data
  ) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          onRetry={() => {
            for (const query of queries) void query.refetch();
          }}
        />
      </div>
    );
  }

  const shipments = unpaidQuery.data.data;
  const payouts = payoutsQuery.data.data;
  const availableConnections = (connections.data ?? []).filter(
    (connection) => connection.isActive,
  );
  const availableAccounts = accounts.data ?? [];
  const busy = createMutation.isPending || importMutation.isPending;

  return (
    <div className="space-y-7 p-4 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          can("reconciliation.manage") ? (
            <button
              type="button"
              onClick={() => setCreating((value) => !value)}
              className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {creating ? <X size={16} /> : <Plus size={16} />}
              {t("newPayout")}
            </button>
          ) : undefined
        }
      />

      {creating ? (
        <section className="space-y-5 border-y py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">{t("newPayout")}</h2>
            <div className="inline-flex border p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "manual"}
                onClick={() => setMode("manual")}
                className={`min-h-9 px-3 text-sm ${mode === "manual" ? "bg-muted font-semibold" : "text-muted-foreground"}`}
              >
                {t("manualEntry")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "csv"}
                onClick={() => setMode("csv")}
                className={`min-h-9 px-3 text-sm ${mode === "csv" ? "bg-muted font-semibold" : "text-muted-foreground"}`}
              >
                {t("importCsv")}
              </button>
            </div>
          </div>
          <PayoutMetadataFields
            metadata={metadata}
            onChange={setMetadata}
            connections={availableConnections}
            accounts={availableAccounts}
          />
          {mode === "manual" ? (
            <PayoutForm
              busy={busy}
              onSubmit={(items) => void submitManual(items)}
            />
          ) : (
            <PayoutCsvImport
              busy={busy}
              onImport={(file) => void submitCsv(file)}
            />
          )}
        </section>
      ) : null}

      <CourierMoneySummary summary={summary.data} />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("unpaidTitle")}</h2>
        {shipments.length === 0 ? (
          <EmptyState title={t("noUnpaidParcels")} />
        ) : (
          <UnpaidTable shipments={shipments} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("payoutsTitle")}</h2>
        {payouts.length === 0 ? (
          <EmptyState title={t("noPayouts")} />
        ) : (
          <PayoutTable payouts={payouts} />
        )}
      </section>
    </div>
  );
}

function UnpaidTable({ shipments }: { shipments: ShipmentDTO[] }) {
  const t = useTranslations("reconciliation");
  return (
    <div className="overflow-x-auto border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("consignment")}</th>
            <th className="px-4 py-3">{t("order")}</th>
            <th className="px-4 py-3">{t("courier")}</th>
            <th className="px-4 py-3">{t("date")}</th>
            <th className="px-4 py-3 text-right">{t("expected")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {shipment.consignmentId ?? shipment.trackingCode ?? "-"}
              </td>
              <td className="px-4 py-3">{shipment.orderNumber}</td>
              <td className="px-4 py-3">
                {shipment.courierName ?? shipment.provider}
              </td>
              <td className="px-4 py-3">
                {shipment.deliveredAt ? formatDate(shipment.deliveredAt) : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                {formatMoney(
                  shipment.collectedAmountPaisa ?? shipment.codAmountPaisa,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
