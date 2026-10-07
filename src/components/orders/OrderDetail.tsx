'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  Copy,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  Truck,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { ErrorState } from '@/components/common/PageStates';
import { DetailSkeleton } from '@/components/common/skeletons';
import { BookShipmentDialog } from '@/components/couriers/BookShipmentDialog';
import { ManualShipmentDialog } from '@/components/couriers/ManualShipmentDialog';
import { ShipmentStatusBadge } from '@/components/couriers/ShipmentStatusBadge';
import { RiskBadge } from '@/components/risk/RiskBadge';
import { RiskCheckDialog } from '@/components/risk/RiskCheckDialog';
import { formatMoney } from '@/lib/money';
import { useOrder, useOrderMutations } from '@/hooks/queries/useOrders';
import {
  useCancelShipment,
  useSyncShipment,
} from '@/hooks/queries/useCouriers';

export function OrderDetail({ orderId }: { orderId: string }) {
  const t = useTranslations('orders');
  const tShip = useTranslations('shipments');
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

  const changeStatus = async (toStatus: string) => {
    if (
      toStatus === 'CONFIRMED' &&
      order.riskLevel === 'HIGH' &&
      !window.confirm(t('confirmHighRiskWarning'))
    ) {
      return;
    }
    try {
      await statusMutation.mutateAsync({ id: order.id, body: { toStatus } });
      toast.success(t('updated'));
    } catch {
      toast.error(t('saveError'));
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    toast.success(tShip('trackingCopied'));
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleSyncShipment = async (shipmentId: string) => {
    try {
      await syncMutation.mutateAsync(shipmentId);
      toast.success(tShip('syncedSuccess'));
      void query.refetch();
    } catch {
      toast.error(tShip('syncFailed'));
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    if (!window.confirm(tShip('cancelShipmentConfirm'))) return;
    try {
      await cancelMutation.mutateAsync({ shipmentId });
      toast.success(tShip('cancelledSuccess'));
      void query.refetch();
    } catch {
      toast.error(tShip('cancelFailed'));
    }
  };

  const canBookCourier =
    !activeShipment && (order.status === 'CONFIRMED' || order.status === 'PACKED');

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('order')}</p>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/orders/${order.id}/print`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t('print')}
          </Link>
          {allowedTransitions.map((next) => (
            <button
              key={next}
              type="button"
              onClick={() => void changeStatus(next)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t(`status.${next}`)}
            </button>
          ))}
        </div>
      </header>

      {/* Shipment Card (Plan 14 §8.3, §8.10) */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="text-primary" size={20} />
            <h2 className="font-semibold text-base">{tShip('shipmentCardTitle')}</h2>
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
                    {activeShipment.trackingCode || activeShipment.consignmentId || '-'}
                  </span>
                  {(activeShipment.trackingCode || activeShipment.consignmentId) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyTracking(
                          activeShipment.trackingCode || activeShipment.consignmentId!,
                        )
                      }
                      className="rounded p-0.5 hover:bg-muted"
                      title={tShip('copy')}
                    >
                      {copiedTracking ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                  {activeShipment.trackingUrl && (
                    <a
                      href={activeShipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-primary hover:underline"
                    >
                      <span>{tShip('trackParcel')}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeShipment.provider !== 'MANUAL' && (
                  <button
                    type="button"
                    onClick={() => void handleSyncShipment(activeShipment.id)}
                    disabled={syncMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={syncMutation.isPending ? 'animate-spin' : ''}
                    />
                    {tShip('sync')}
                  </button>
                )}
                {activeShipment.status !== 'DELIVERED' &&
                  activeShipment.status !== 'RETURNED' &&
                  activeShipment.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => void handleCancelShipment(activeShipment.id)}
                      disabled={cancelMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      {tShip('cancelShipment')}
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
                  ? tShip('readyToShip')
                  : tShip('notReadyToShipHint')}
              </p>
              <p className="text-xs text-muted-foreground">
                {canBookCourier
                  ? tShip('readyToShipDesc')
                  : tShip('confirmFirstHint')}
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
                  {tShip('bookCourier')}
                </button>
                <button
                  type="button"
                  onClick={() => setManualDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Truck size={15} />
                  {tShip('manualCourier')}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t('items')}</h2>
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
            <p className="py-4 text-sm text-muted-foreground">{t('noItems')}</p>
          )}
          <div className="mt-4 flex justify-between font-semibold">
            <span>{t('total')}</span>
            <span>{formatMoney(order.totalPaisa)}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{tShip('codAmount')}</span>
            <span>{formatMoney(order.codAmountPaisa)}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t('customer')}</h2>
          <p className="mt-3 font-medium">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          <p className="mt-2 text-sm">{order.address}</p>
          {order.district && (
            <p className="mt-1 text-xs text-muted-foreground">
              {tShip('district')}: {order.district}
            </p>
          )}
          <p className="mt-4 rounded-full bg-muted px-3 py-2 text-center text-sm font-medium">
            {t(`status.${order.status}`)}
          </p>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('riskAssessment')}
              </span>
              <button
                type="button"
                onClick={() => setRiskDialogOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ShieldCheck size={14} />
                <span>{order.riskLevel ? t('recheckRisk') : t('checkRisk')}</span>
              </button>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <RiskBadge
                level={order.riskLevel}
                score={order.riskScore}
                showScore
              />
            </div>
            {order.riskLevel === 'HIGH' && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {t('highRiskWarning')}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">{t('timeline')}</h2>
        <div className="mt-3 space-y-3">
          {statusEvents.map((event) => (
            <div key={event.id} className="flex gap-3 text-sm">
              <span className="size-2 mt-2 rounded-full bg-primary" />
              <span>
                {t(`status.${event.toStatus}`)}
                <span className="ml-2 text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString('en-GB')}
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
