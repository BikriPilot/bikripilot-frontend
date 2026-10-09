"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import { ordersApi } from "@/lib/api/orders.api";
import { Field } from "@/components/common/Field";
import { PAYMENT_METHODS } from "@/constants/enums";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  Truck,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { BookShipmentDialog } from "@/components/couriers/BookShipmentDialog";
import { ManualShipmentDialog } from "@/components/couriers/ManualShipmentDialog";
import { ShipmentStatusBadge } from "@/components/couriers/ShipmentStatusBadge";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { RiskCheckDialog } from "@/components/risk/RiskCheckDialog";
import { formatMoney } from "@/lib/money";
import { OrderForm } from "./OrderForm";
import { useOrder, useOrderMutations } from "@/hooks/queries/useOrders";
import {
  useCancelShipment,
  useSyncShipment,
} from "@/hooks/queries/useCouriers";

export function OrderDetail({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const paymentText = useTranslations("orders.advance");
  const methodText = useTranslations("enums.PaymentMethod");
  const { shopId, can } = useCurrentShop();
  const client = useQueryClient();
  const accounts = useQuery({
    queryKey: ["hisab", shopId, "accounts"],
    queryFn: () => hisabApi.accounts(shopId!),
    enabled: Boolean(shopId && can("hisab.read")),
  });
  const receipt = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      ordersApi.payment(shopId!, orderId, body),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders", shopId] }),
        client.invalidateQueries({ queryKey: ["hisab", shopId] }),
        client.invalidateQueries({ queryKey: ["dashboard", shopId] }),
      ]);
    },
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const tShip = useTranslations("shipments");
  const query = useOrder(orderId);
  const statusMutation = useOrderMutations().status;
  const syncMutation = useSyncShipment();
  const cancelMutation = useCancelShipment();

  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (query.isPending) return <DetailSkeleton />;
  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const order = query.data;
  const items = order.items ?? [];
  const statusEvents = order.statusEvents ?? [];
  const allowedTransitions = order.allowedTransitions ?? [];
  const activeShipment = order.activeShipment;
  if (editing)
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="min-h-11 rounded-lg border px-4"
          onClick={() => setEditing(false)}
        >
          {t("form.cancelEdit")}
        </button>
        <OrderForm
          initialOrder={order}
          onSaved={() => {
            setEditing(false);
            void query.refetch();
          }}
        />
      </div>
    );

  const changeStatus = async (toStatus: string) => {
    let cancelReason: string | undefined;
    let restock: boolean | undefined;
    if (toStatus === "CANCELLED") {
      const reason = window.prompt(t("form.cancelReason"));
      if (!reason?.trim()) return;
      cancelReason = reason.trim();
    }
    if (toStatus === "RETURNED") {
      if (!window.confirm(t("form.confirmReturn"))) return;
      restock = window.confirm(t("form.restock"));
    }
    if (
      toStatus === "CONFIRMED" &&
      !window.confirm(paymentText("confirmOrder"))
    )
      return;
    if (
      toStatus === "CONFIRMED" &&
      order.riskLevel === "HIGH" &&
      !window.confirm(t("confirmHighRiskWarning"))
    ) {
      return;
    }
    try {
      await statusMutation.mutateAsync({
        id: order.id,
        body: {
          toStatus,
          ...(cancelReason ? { cancelReason } : {}),
          ...(restock !== undefined ? { restock } : {}),
        },
      });
      toast.success(t("updated"));
    } catch {
      toast.error(t("saveError"));
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    toast.success(tShip("trackingCopied"));
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleSyncShipment = async (shipmentId: string) => {
    try {
      await syncMutation.mutateAsync(shipmentId);
      toast.success(tShip("syncedSuccess"));
      void query.refetch();
    } catch {
      toast.error(tShip("syncFailed"));
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    if (!window.confirm(tShip("cancelShipmentConfirm"))) return;
    try {
      await cancelMutation.mutateAsync({ shipmentId });
      toast.success(tShip("cancelledSuccess"));
      void query.refetch();
    } catch {
      toast.error(tShip("cancelFailed"));
    }
  };

  const canBookCourier =
    !activeShipment &&
    (order.status === "CONFIRMED" || order.status === "PACKED");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("order")}</p>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {can("order.write") &&
            ["DRAFT", "PENDING", "CONFIRMED", "PACKED"].includes(
              order.status,
            ) && (
              <button
                type="button"
                className="min-h-11 rounded-lg border px-4"
                onClick={() => setEditing(true)}
              >
                {t("form.edit")}
              </button>
            )}
          <Link
            href={`/dashboard/orders/${order.id}/print`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("print")}
          </Link>
          {allowedTransitions.map((next) => (
            <button
              key={next}
              type="button"
              onClick={() => void changeStatus(next)}
              disabled={
                statusMutation.isPending ||
                (next === "CONFIRMED" &&
                  order.advanceRequired &&
                  order.advancePaidPaisa < order.requiredAdvancePaisa)
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t(`status.${next}`)}
            </button>
          ))}
        </div>
      </header>

      <section className="border-y bg-card px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">{paymentText("title")}</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              role="switch"
              disabled
              checked={
                order.advanceRequired &&
                order.advancePaidPaisa >= order.requiredAdvancePaisa
              }
              className="size-5 accent-success"
            />
            {order.advanceRequired
              ? order.advancePaidPaisa >= order.requiredAdvancePaisa
                ? paymentText("verified")
                : paymentText("awaiting")
              : paymentText("none")}
          </label>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            [paymentText("required"), order.requiredAdvancePaisa],
            [paymentText("received"), order.advancePaidPaisa],
            [paymentText("remaining"), order.codAmountPaisa],
          ].map(([label, amount]) => (
            <div key={String(label)}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(Number(amount) || 0)}
              </dd>
            </div>
          ))}
        </dl>
        <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              {paymentText("transaction")}
            </dt>
            <dd className="break-all font-mono text-sm">
              {order.paymentTransactionId || paymentText("notSubmitted")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              {paymentText("sender")}
            </dt>
            <dd className="text-sm">
              {order.paymentSenderPhone || paymentText("notSubmitted")}
            </dd>
          </div>
        </dl>
        {can("order.write") &&
          can("hisab.read") &&
          order.codAmountPaisa > 0 &&
          !["CANCELLED", "RETURNED"].includes(order.status) && (
            <>
              <button
                type="button"
                onClick={() => setPaymentOpen(!paymentOpen)}
                className="mt-4 min-h-11 rounded-lg border px-4 text-sm font-medium"
              >
                {paymentText("record")}
              </button>
              {paymentOpen && (
                <form
                  className="mt-4 grid max-w-xl gap-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const values = new FormData(event.currentTarget);
                    const amountPaisa = Math.round(
                      Number(values.get("amount")) * 100,
                    );
                    if (
                      !Number.isInteger(amountPaisa) ||
                      amountPaisa <= 0 ||
                      amountPaisa > order.codAmountPaisa
                    ) {
                      toast.error(paymentText("error"));
                      return;
                    }
                    try {
                      await receipt.mutateAsync({
                        amountPaisa,
                        method: values.get("method"),
                        moneyAccountId: values.get("account"),
                        note: order.paymentTransactionId
                          ? `Seller verified transaction ${order.paymentTransactionId}; sender ${order.paymentSenderPhone || "-"}`
                          : "Seller verified receipt",
                      });
                      setPaymentOpen(false);
                      toast.success(paymentText("saved"));
                    } catch {
                      toast.error(paymentText("error"));
                    }
                  }}
                >
                  <Field
                    label={paymentText("amount")}
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={order.codAmountPaisa / 100}
                    defaultValue={
                      Math.min(
                        order.codAmountPaisa,
                        Math.max(
                          0,
                          order.requiredAdvancePaisa - order.advancePaidPaisa,
                        ),
                      ) / 100 || ""
                    }
                    required
                  />
                  <label className="grid gap-2 text-sm">
                    {paymentText("method")}
                    <select
                      name="method"
                      className="min-h-11 rounded-lg border bg-background px-3 text-base"
                      defaultValue="BKASH"
                    >
                      {PAYMENT_METHODS.filter((method) => method !== "COD").map(
                        (method) => (
                          <option key={method} value={method}>
                            {methodText(method)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    {paymentText("account")}
                    <select
                      name="account"
                      required
                      className="min-h-11 rounded-lg border bg-background px-3 text-base"
                    >
                      <option value="">{paymentText("account")}</option>
                      {accounts.data
                        ?.filter(
                          (account) =>
                            account.kind !== "COURIER" && !account.isArchived,
                        )
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  {accounts.isError && (
                    <ErrorState onRetry={() => void accounts.refetch()} />
                  )}
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" required className="mt-1 size-4" />
                    {paymentText("confirm")}
                  </label>
                  <button
                    disabled={
                      receipt.isPending ||
                      accounts.isPending ||
                      accounts.isError
                    }
                    className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  >
                    {receipt.isPending ? t("saving") : paymentText("save")}
                  </button>
                </form>
              )}
            </>
          )}
      </section>

      {/* Shipment Card (Plan 14 §8.3, §8.10) */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="text-primary" size={20} />
            <h2 className="font-semibold text-base">
              {tShip("shipmentCardTitle")}
            </h2>
          </div>
          {activeShipment && (
            <ShipmentStatusBadge status={activeShipment.status} />
          )}
        </div>

        {activeShipment ? (
          <div className="mt-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">
                  {activeShipment.courierName || activeShipment.provider}
                </p>
                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span>
                    {activeShipment.trackingCode ||
                      activeShipment.consignmentId ||
                      "-"}
                  </span>
                  {(activeShipment.trackingCode ||
                    activeShipment.consignmentId) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyTracking(
                          activeShipment.trackingCode ||
                            activeShipment.consignmentId!,
                        )
                      }
                      className="rounded p-0.5 hover:bg-muted"
                      title={tShip("copy")}
                    >
                      {copiedTracking ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  )}
                  {activeShipment.trackingUrl && (
                    <a
                      href={activeShipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-primary hover:underline"
                    >
                      <span>{tShip("trackParcel")}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeShipment.provider !== "MANUAL" && (
                  <button
                    type="button"
                    onClick={() => void handleSyncShipment(activeShipment.id)}
                    disabled={syncMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={syncMutation.isPending ? "animate-spin" : ""}
                    />
                    {tShip("sync")}
                  </button>
                )}
                {activeShipment.status !== "DELIVERED" &&
                  activeShipment.status !== "RETURNED" &&
                  activeShipment.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleCancelShipment(activeShipment.id)
                      }
                      disabled={cancelMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      {tShip("cancelShipment")}
                    </button>
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4">
            <div>
              <p className="text-sm font-medium">
                {canBookCourier
                  ? tShip("readyToShip")
                  : t(`status.${order.status}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {canBookCourier
                  ? tShip("readyToShipDesc")
                  : ["DRAFT", "PENDING"].includes(order.status)
                    ? tShip("confirmFirstHint")
                    : t("form.noShipment")}
              </p>
            </div>
            {canBookCourier && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <PackageCheck size={16} />
                  {tShip("bookCourier")}
                </button>
                <button
                  type="button"
                  onClick={() => setManualDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Truck size={15} />
                  {tShip("manualCourier")}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t("items")}</h2>
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-3 last:border-0"
              >
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatMoney(item.lineTotalPaisa)}</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground">{t("noItems")}</p>
          )}
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt>{t("subtotal")}</dt>
              <dd className="tabular-nums">
                {formatMoney(order.subtotalPaisa)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{t("discount")}</dt>
              <dd className="tabular-nums">
                -{formatMoney(order.discountPaisa)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{t("deliveryCharge")}</dt>
              <dd className="text-right tabular-nums">
                {order.deliveryChargePaisa === 0
                  ? t("freeDelivery")
                  : formatMoney(order.deliveryChargePaisa)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <dt>{paymentText("policy")}</dt>
              <dd className="text-right">
                {order.advanceRequired
                  ? paymentText("required")
                  : paymentText("none")}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between font-semibold">
            <span>{t("total")}</span>
            <span>{formatMoney(order.totalPaisa)}</span>
          </div>
          <div className="mt-3 flex justify-between gap-3 text-sm">
            <span>{paymentText("received")}</span>
            <span className="tabular-nums">
              -{formatMoney(order.advancePaidPaisa)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{tShip("codAmount")}</span>
            <span>{formatMoney(order.codAmountPaisa)}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t("customer")}</h2>
          <p className="mt-3 font-medium">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          <p className="mt-2 text-sm">{order.address}</p>
          {order.district && (
            <p className="mt-1 text-xs text-muted-foreground">
              {tShip("district")}: {order.district}
            </p>
          )}
          <p className="mt-4 rounded-full bg-muted px-3 py-2 text-center text-sm font-medium">
            {t(`status.${order.status}`)}
          </p>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("riskAssessment")}
              </span>
              <button
                type="button"
                onClick={() => setRiskDialogOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ShieldCheck size={14} />
                <span>
                  {order.riskLevel ? t("recheckRisk") : t("checkRisk")}
                </span>
              </button>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <RiskBadge
                level={order.riskLevel}
                score={order.riskScore}
                showScore
              />
            </div>
            {order.riskLevel === "HIGH" && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {t("highRiskWarning")}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">{t("timeline")}</h2>
        <div className="mt-3 space-y-3">
          {statusEvents.map((event) => (
            <div key={event.id} className="flex gap-3 text-sm">
              <span className="size-2 mt-2 rounded-full bg-primary" />
              <span>
                {t(`status.${event.toStatus}`)}
                <span className="ml-2 text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString("en-GB")}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <BookShipmentDialog
        order={order}
        open={bookDialogOpen}
        onClose={() => {
          setBookDialogOpen(false);
          void query.refetch();
        }}
      />

      <ManualShipmentDialog
        order={order}
        open={manualDialogOpen}
        onClose={() => {
          setManualDialogOpen(false);
          void query.refetch();
        }}
      />

      <RiskCheckDialog
        phone={order.customerPhone}
        orderId={order.id}
        open={riskDialogOpen}
        onClose={() => {
          setRiskDialogOpen(false);
          void query.refetch();
        }}
      />
    </div>
  );
}
