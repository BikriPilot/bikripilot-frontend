'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PackageCheck, Truck } from 'lucide-react';
import { ShipmentStatusBadge } from '@/components/couriers/ShipmentStatusBadge';
import { RiskBadge } from '@/components/risk/RiskBadge';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';
import type { OrderListItemDTO } from '@/types/order';

interface OrderTableProps {
  items: OrderListItemDTO[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onBookCourier?: (order: OrderListItemDTO) => void;
}

export function OrderTable({
  items,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onBookCourier,
}: OrderTableProps) {
  const t = useTranslations('orders');
  const tShip = useTranslations('shipments');
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
          <tr>
            {onToggleSelect && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="size-4 rounded-sm border-primary text-primary accent-primary"
                  aria-label="Select all"
                />
              </th>
            )}
            <th className="px-4 py-3 font-semibold">{t('number')}</th>
            <th className="px-4 py-3 font-semibold">{t('customer')}</th>
            <th className="px-4 py-3 font-semibold">{t('total')}</th>
            <th className="px-4 py-3 font-semibold">{t('statusLabel')}</th>
            <th className="px-4 py-3 font-semibold">{tShip('courier')}</th>
            <th className="px-4 py-3 font-semibold">{t('date')}</th>
            <th className="px-4 py-3 text-right font-semibold">{tShip('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const canBook =
              !item.shipment &&
              (item.status === 'CONFIRMED' || item.status === 'PACKED');

            return (
              <tr
                key={item.id}
                className={`transition-colors hover:bg-muted/20 ${
                  isSelected ? 'bg-primary/5' : ''
                }`}
              >
                {onToggleSelect && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="size-4 rounded-sm border-primary text-primary accent-primary"
                      aria-label={`Select ${item.orderNumber}`}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <Link
                    className="font-semibold text-primary hover:underline"
                    href={`/dashboard/orders/${item.id}`}
                  >
                    {item.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium">{item.customerName}</span>
                    {item.riskLevel && (
                      <RiskBadge level={item.riskLevel} size="sm" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.customerPhone}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatMoney(item.totalPaisa)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {t(`status.${item.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {item.shipment ? (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        <Truck size={12} className="text-muted-foreground" />
                        {item.shipment.trackingCode || item.shipment.provider}
                      </span>
                      <ShipmentStatusBadge status={item.shipment.status} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {canBook && onBookCourier && (
                    <button
                      type="button"
                      onClick={() => onBookCourier(item)}
                      className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                    >
                      <PackageCheck size={13} />
                      {tShip('bookCourier')}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
