'use client';

import { useTranslations } from 'next-intl';
import { Package, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import type { RiskCheckSummary } from '@/types/risk';

interface RiskSummaryTilesProps {
  summary: RiskCheckSummary;
}

export function RiskSummaryTiles({ summary }: RiskSummaryTilesProps) {
  const t = useTranslations('risk.summary');

  const successPercent = Math.round((summary.successRate ?? 0) * 100);

  const tiles = [
    {
      label: t('totalOrders'),
      value: String(summary.totalOrders ?? 0),
      icon: Package,
      color: 'text-foreground',
      bg: 'bg-muted/50',
    },
    {
      label: t('receivedOrders'),
      value: String(summary.receivedOrders ?? 0),
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: t('cancelledOrReturned'),
      value: String(summary.cancelledOrReturnedOrders ?? 0),
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: t('successRate'),
      value: `${successPercent}%`,
      icon: TrendingUp,
      color:
        successPercent >= 80
          ? 'text-emerald-600 dark:text-emerald-400'
          : successPercent >= 60
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400',
      bg:
        successPercent >= 80
          ? 'bg-emerald-500/10'
          : successPercent >= 60
            ? 'bg-amber-500/10'
            : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {tile.label}
              </span>
              <div className={`grid size-7 place-items-center rounded-lg ${tile.bg}`}>
                <Icon size={15} className={tile.color} />
              </div>
            </div>
            <div className={`mt-3 text-2xl font-bold tracking-tight ${tile.color}`}>
              {tile.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
