'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useBulkBookShipments, useCouriers } from '@/hooks/queries/useCouriers';

interface BulkBookDialogProps {
  orderIds: string[];
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkBookDialog({
  orderIds,
  open,
  onClose,
  onSuccess,
}: BulkBookDialogProps) {
  const t = useTranslations('shipments.bulk');
  const { data: couriers, isPending: couriersLoading } = useCouriers();
  const bulkMutation = useBulkBookShipments();

  const activeCouriers = couriers?.filter((c) => c.isActive) || [];
  const defaultCourier = activeCouriers.find((c) => c.isDefault) || activeCouriers[0];

  const [selectedCourierId, setSelectedCourierId] = useState('');
  const effectiveCourierId = selectedCourierId || defaultCourier?.id || '';

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCourierId) {
      toast.error(t('selectCourierError'));
      return;
    }

    try {
      const res = await bulkMutation.mutateAsync({
        orderIds,
        courierConnectionId: effectiveCourierId,
      });

      const successCount = res.succeeded.length;
      const failCount = res.failed.length;

      if (failCount === 0) {
        toast.success(t('allSucceeded', { count: successCount }));
      } else {
        toast.info(t('partialResult', { success: successCount, failed: failCount }));
      }

      onSuccess?.();
      onClose();
    } catch {
      toast.error(t('bulkFailed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-primary" size={20} />
            <h2 className="text-xl font-semibold">{t('title')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-xl border bg-primary/5 p-4 text-sm">
          <p className="font-semibold text-primary">
            {t('selectedCount', { count: orderIds.length })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('bulkDescription')}
          </p>
        </div>

        {couriersLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('loadingCouriers')}</p>
        ) : activeCouriers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="font-medium text-sm">{t('noCouriersConnected')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('selectCourier')}</label>
              <select
                value={effectiveCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="h-11 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                required
              >
                {activeCouriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.provider}) {c.isDefault ? `[${t('default')}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={bulkMutation.isPending}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={bulkMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {bulkMutation.isPending ? t('booking') : t('confirmBulkBooking')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
