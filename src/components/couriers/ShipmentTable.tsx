'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, ErrorState } from '@/components/common/PageStates';
import { ResponsiveListSkeleton } from '@/components/common/skeletons';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';
import {
  useCancelShipment,
  useShipments,
  useSyncShipment,
  useUpdateManualStatus,
} from '@/hooks/queries/useCouriers';
import type { CourierProvider, ShipmentDTO, ShipmentStatus } from '@/types/courier';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';

const STATUS_TABS: { key: string; labelKey: string; statuses?: ShipmentStatus[] }[] = [
  { key: 'all', labelKey: 'all' },
  { key: 'pending', labelKey: 'pending', statuses: ['CREATED', 'PICKUP_PENDING'] },
  { key: 'in_transit', labelKey: 'inTransit', statuses: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
  { key: 'delivered', labelKey: 'delivered', statuses: ['DELIVERED', 'PARTIAL_DELIVERED'] },
  { key: 'on_hold', labelKey: 'onHold', statuses: ['ON_HOLD'] },
  { key: 'returned', labelKey: 'returned', statuses: ['RETURNING', 'RETURNED'] },
  { key: 'cancelled', labelKey: 'cancelled', statuses: ['CANCELLED'] },
];

export function ShipmentTable() {
  const t = useTranslations('shipments');
  const [activeTab, setActiveTab] = useState('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual status modal state
  const [manualModalShipment, setManualModalShipment] = useState<ShipmentDTO | null>(null);
  const [newManualStatus, setNewManualStatus] = useState<'DELIVERED' | 'PARTIAL_DELIVERED' | 'RETURNED' | 'IN_TRANSIT' | 'ON_HOLD'>('DELIVERED');
  const [manualNote, setManualNote] = useState('');

  // Cancel modal state
  const [cancelModalShipment, setCancelModalShipment] = useState<ShipmentDTO | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const currentTabObj = STATUS_TABS.find((t) => t.key === activeTab);
  const statusParam = currentTabObj?.statuses?.[0]; // backend accepts single status or filter

  const { data, isPending, isError, refetch } = useShipments({
    page,
    limit: 25,
    search: search.trim() || undefined,
    provider: providerFilter !== 'all' ? (providerFilter as CourierProvider) : undefined,
    status: statusParam,
  });

  const syncMutation = useSyncShipment();
  const cancelMutation = useCancelShipment();
  const manualStatusMutation = useUpdateManualStatus();

  const shipments = data?.data || [];
  const meta = data?.meta;

  const handleCopyTracking = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(t('trackingCopied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSync = async (shipment: ShipmentDTO) => {
    try {
      await syncMutation.mutateAsync(shipment.id);
      toast.success(t('syncedSuccess'));
    } catch {
      toast.error(t('syncFailed'));
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalShipment) return;
    try {
      await cancelMutation.mutateAsync({
        shipmentId: cancelModalShipment.id,
        input: { reason: cancelReason.trim() || undefined },
      });
      toast.success(t('cancelledSuccess'));
      setCancelModalShipment(null);
      setCancelReason('');
    } catch {
      toast.error(t('cancelFailed'));
    }
  };

  const handleConfirmManualStatus = async () => {
    if (!manualModalShipment) return;
    try {
      await manualStatusMutation.mutateAsync({
        shipmentId: manualModalShipment.id,
        input: {
          status: newManualStatus,
          note: manualNote.trim() || undefined,
        },
      });
      toast.success(t('statusUpdatedSuccess'));
      setManualModalShipment(null);
      setManualNote('');
    } catch {
      toast.error(t('statusUpdateFailed'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t(`tabs.${tab.labelKey}`)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border bg-card px-2.5 text-xs outline-none focus:border-primary"
          >
            <option value="all">{t('allProviders')}</option>
            <option value="STEADFAST">Steadfast</option>
            <option value="PATHAO">Pathao</option>
            <option value="REDX">RedX</option>
            <option value="MANUAL">{t('manual')}</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="h-9 w-48 rounded-lg border bg-card pl-8 pr-3 text-xs outline-none focus:border-primary sm:w-60"
            />
          </div>
        </div>
      </div>

      {isPending ? (
        <ResponsiveListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : shipments.length === 0 ? (
        <EmptyState title={t('noShipmentsFound')} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto rounded-2xl border bg-card md:block">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('order')}</th>
                  <th className="px-4 py-3 font-semibold">{t('customer')}</th>
                  <th className="px-4 py-3 font-semibold">{t('courier')}</th>
                  <th className="px-4 py-3 font-semibold">{t('tracking')}</th>
                  <th className="px-4 py-3 font-semibold">{t('status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('codAmount')}</th>
                  <th className="px-4 py-3 font-semibold">{t('bookedDate')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shipments.map((s) => {
                  const tracking = s.trackingCode || s.consignmentId || '-';
                  const isManual = s.provider === 'MANUAL';
                  const canCancel =
                    s.status !== 'DELIVERED' &&
                    s.status !== 'RETURNED' &&
                    s.status !== 'CANCELLED';

                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">
                        <Link
                          href={`/dashboard/orders/${s.orderId}`}
                          className="text-primary hover:underline"
                        >
                          {s.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs">{s.customerName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {s.courierName || s.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>{tracking}</span>
                          {tracking !== '-' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyTracking(s.id, tracking)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title={t('copy')}
                              >
                                {copiedId === s.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                              {s.trackingUrl && (
                                <a
                                  href={s.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded p-1 text-primary hover:bg-primary/10"
                                  title={t('trackExternal')}
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ShipmentStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(s.codAmountPaisa)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(s.bookedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isManual && (
                            <button
                              type="button"
                              onClick={() => void handleSync(s)}
                              disabled={syncMutation.isPending}
                              className="rounded-lg border px-2 py-1 text-xs font-medium hover:bg-muted"
                              title={t('syncTooltip')}
                            >
                              <RefreshCw size={12} className={syncMutation.isPending ? 'animate-spin' : ''} />
                            </button>
                          )}
                          {isManual && (
                            <button
                              type="button"
                              onClick={() => {
                                setManualModalShipment(s);
                                setManualNote('');
                              }}
                              className="rounded-lg border px-2 py-1 text-xs font-medium hover:bg-muted"
                            >
                              {t('updateStatus')}
                            </button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalShipment(s);
                                setCancelReason('');
                              }}
                              className="rounded-lg border border-danger/30 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                            >
                              {t('cancel')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {shipments.map((s) => {
              const tracking = s.trackingCode || s.consignmentId || '-';
              const isManual = s.provider === 'MANUAL';
              const canCancel =
                s.status !== 'DELIVERED' &&
                s.status !== 'RETURNED' &&
                s.status !== 'CANCELLED';

              return (
                <div key={s.id} className="rounded-xl border bg-card p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/dashboard/orders/${s.orderId}`}
                        className="font-semibold text-primary"
                      >
                        {s.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.customerName}</p>
                    </div>
                    <ShipmentStatusBadge status={s.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex rounded-md border bg-muted px-1.5 py-0.5 font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.courierName || s.provider}
                    </span>
                    <span className="font-semibold">{formatMoney(s.codAmountPaisa)}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
                    <div className="flex items-center gap-1 font-mono text-muted-foreground">
                      <span>{tracking}</span>
                      {tracking !== '-' && (
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(s.id, tracking)}
                          className="p-1"
                        >
                          {copiedId === s.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                    <span className="text-muted-foreground">{formatDate(s.bookedAt)}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2">
                    {!isManual && (
                      <button
                        type="button"
                        onClick={() => void handleSync(s)}
                        disabled={syncMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        <RefreshCw size={12} />
                        {t('sync')}
                      </button>
                    )}
                    {isManual && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualModalShipment(s);
                          setManualNote('');
                        }}
                        className="rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        {t('updateStatus')}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelModalShipment(s);
                          setCancelReason('');
                        }}
                        className="rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
                      >
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                {t('pageInfo', { page: meta.page, total: meta.totalPages })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border px-3 py-1 font-semibold disabled:opacity-50"
                >
                  {t('previous')}
                </button>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border px-3 py-1 font-semibold disabled:opacity-50"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Manual Status Modal */}
      {manualModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl">
            <h3 className="text-base font-semibold">{t('updateManualTitle')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {manualModalShipment.orderNumber} — {manualModalShipment.customerName}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">{t('newStatus')}</label>
                <select
                  value={newManualStatus}
                  onChange={(e) =>
                    setNewManualStatus(
                      e.target.value as 'DELIVERED' | 'PARTIAL_DELIVERED' | 'RETURNED' | 'IN_TRANSIT' | 'ON_HOLD',
                    )
                  }
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                >
                  <option value="IN_TRANSIT">{t('status.IN_TRANSIT')}</option>
                  <option value="DELIVERED">{t('status.DELIVERED')}</option>
                  <option value="PARTIAL_DELIVERED">{t('status.PARTIAL_DELIVERED')}</option>
                  <option value="ON_HOLD">{t('status.ON_HOLD')}</option>
                  <option value="RETURNED">{t('status.RETURNED')}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">{t('note')}</label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder={t('notePlaceholder')}
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setManualModalShipment(null)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmManualStatus}
                disabled={manualStatusMutation.isPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                {manualStatusMutation.isPending ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl">
            <div className="flex items-center gap-2 text-danger">
              <XCircle size={18} />
              <h3 className="text-base font-semibold">{t('cancelShipmentTitle')}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('cancelShipmentWarning', { orderNumber: cancelModalShipment.orderNumber })}
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium">{t('cancelReason')}</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('cancelReasonPlaceholder')}
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalShipment(null)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white"
              >
                {cancelMutation.isPending ? t('cancelling') : t('confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
