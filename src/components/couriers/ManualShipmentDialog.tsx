'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/common/Field';
import { useManualShipment } from '@/hooks/queries/useCouriers';
import type { OrderDTO, OrderListItemDTO } from '@/types/order';

interface ManualShipmentDialogProps {
  order: OrderDTO | OrderListItemDTO;
  open: boolean;
  onClose: () => void;
}

export function ManualShipmentDialog({
  order,
  open,
  onClose,
}: ManualShipmentDialogProps) {
  const t = useTranslations('shipments.manual');
  const manualMutation = useManualShipment();

  const [courierName, setCourierName] = useState('Sundarban Courier');
  const [trackingCode, setTrackingCode] = useState('');
  const [codAmountTaka, setCodAmountTaka] = useState(
    String(Math.round(order.codAmountPaisa / 100)),
  );

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim()) {
      toast.error(t('courierNameRequired'));
      return;
    }

    const codPaisa = Math.round(Number(codAmountTaka || 0) * 100);

    try {
      await manualMutation.mutateAsync({
        orderId: order.id,
        courierName: courierName.trim(),
        trackingCode: trackingCode.trim() || undefined,
        codAmountPaisa: codPaisa,
      });

      toast.success(t('createdSuccess'));
      onClose();
    } catch {
      toast.error(t('createFailed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="text-primary" size={20} />
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

        <div className="mb-5 rounded-xl border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>{order.orderNumber}</span>
            <span>{order.customerName}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{order.customerPhone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label={t('courierName')}
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            placeholder="e.g. Sundarban Courier, SA Paribahan, Paperfly"
            required
          />

          <Field
            label={t('trackingCode')}
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="e.g. CN-1029384"
          />

          <Field
            label={t('codAmountTaka')}
            type="number"
            value={codAmountTaka}
            onChange={(e) => setCodAmountTaka(e.target.value)}
            placeholder="0"
          />

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={manualMutation.isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={manualMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {manualMutation.isPending ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
