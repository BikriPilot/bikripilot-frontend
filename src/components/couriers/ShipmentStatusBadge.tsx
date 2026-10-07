'use client';

import { useTranslations } from 'next-intl';
import type { ShipmentStatus } from '@/types/courier';

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  CREATED: 'bg-muted text-muted-foreground border-border/50',
  PICKUP_PENDING: 'bg-muted text-muted-foreground border-border/50',
  IN_TRANSIT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  OUT_FOR_DELIVERY: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  PARTIAL_DELIVERED: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
  ON_HOLD: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  RETURNING: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  RETURNED: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  CANCELLED: 'bg-muted text-muted-foreground/70 border-border/30 line-through',
  UNKNOWN: 'bg-muted text-muted-foreground border-border/50',
};

export function ShipmentStatusBadge({ status, className = '' }: ShipmentStatusBadgeProps) {
  const t = useTranslations('shipments.status');
  const style = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight ${style} ${className}`}
    >
      {t(status)}
    </span>
  );
}
