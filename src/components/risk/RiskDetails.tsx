'use client';

import { useTranslations } from 'next-intl';
import {
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Network,
  Truck,
  Store,
  XCircle,
} from 'lucide-react';
import type { RiskCheckDTO, RiskRecommendation } from '@/types/risk';
import { RiskBadge } from './RiskBadge';
import { RiskSummaryTiles } from './RiskSummaryTiles';

interface RiskDetailsProps {
  data: RiskCheckDTO;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const RECOMMENDATION_STYLES: Record<
  RiskRecommendation,
  { bg: string; text: string; border: string; icon: typeof ShieldCheck }
> = {
  ACCEPT_COD: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    icon: ShieldCheck,
  },
  COLLECT_ADVANCE: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/20',
    icon: ShieldAlert,
  },
  CALL_TO_VERIFY: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    icon: Info,
  },
  MANUAL_REVIEW: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/20',
    icon: AlertTriangle,
  },
};

export function RiskDetails({
  data,
  onRefresh,
  isRefreshing = false,
}: RiskDetailsProps) {
  const t = useTranslations('risk');
  const tRec = useTranslations('risk.recommendations');
  const tReasons = useTranslations('risk.reasons');

  const recConfig =
    RECOMMENDATION_STYLES[data.recommendation] ||
    RECOMMENDATION_STYLES.MANUAL_REVIEW;
  const RecIcon = recConfig.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner: Score, Badge & Recommendation */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-muted/60 border font-mono">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  data.score <= 30
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : data.score <= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.score}
              </span>
              <span className="absolute bottom-1 text-[10px] font-medium text-muted-foreground">
                / 100
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {data.phone}
                </h3>
                <RiskBadge level={data.level} />
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium shadow-2xs ${recConfig.bg} ${recConfig.border} ${recConfig.text}">
                <RecIcon size={14} />
                <span>{tRec(data.recommendation)}</span>
              </div>
            </div>
          </div>

          {onRefresh && (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <RotateCw
                  size={14}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                <span>{t('checkAgain')}</span>
              </button>
              {data.cached && (
                <span className="text-[11px] text-muted-foreground">
                  {t('cachedNotice')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reasons */}
        {data.reasons && data.reasons.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('assessmentFactors')}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {data.reasons.map((reason) => {
                const label = tReasons(reason);
                return (
                  <span
                    key={reason}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted/80 px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Info size={12} className="text-muted-foreground" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate 4-tile summary */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          {t('overallPerformance')}
        </h4>
        <RiskSummaryTiles summary={data.summary} />
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Network Breakdown */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5">
          <div>
            <div className="flex items-center gap-2 border-b pb-3">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Network size={16} />
              </div>
              <div>
                <h5 className="font-semibold text-sm">{t('networkTitle')}</h5>
                <p className="text-[11px] text-muted-foreground">
                  {t('networkShopsCount', { count: data.network.shops })}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                <span className="font-semibold">{data.network.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {data.network.delivered}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('returned')}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {data.network.returned}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cancelled')}</span>
                <span className="font-semibold">{data.network.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* External Courier Breakdown */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5">
          <div>
            <div className="flex items-center gap-2 border-b pb-3">
              <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Truck size={16} />
              </div>
              <div>
                <h5 className="font-semibold text-sm">{t('externalTitle')}</h5>
                <p className="text-[11px] text-muted-foreground">
                  {data.external.courier === 'NONE'
                    ? t('noExternalCourier')
                    : data.external.courier}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                <span className="font-semibold">{data.external.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {data.external.delivered}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cancelled')}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {data.external.cancelled}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* This Shop Breakdown */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5">
          <div>
            <div className="flex items-center gap-2 border-b pb-3">
              <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Store size={16} />
              </div>
              <div>
                <h5 className="font-semibold text-sm">{t('thisShopTitle')}</h5>
                <p className="text-[11px] text-muted-foreground">
                  {t('thisShopSubtitle')}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                <span className="font-semibold">{data.internal.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {data.internal.delivered}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('returned')}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {data.internal.returned}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cancelled')}</span>
                <span className="font-semibold">{data.internal.cancelled}</span>
              </div>
              {data.internal.isBlocked && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t">
                  <span>{t('blockedInYourShop')}</span>
                  <XCircle size={14} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Callout Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">{t('privacyGuaranteed')}:</strong>{' '}
          {t('privacyDescription')}
        </p>
      </div>
    </div>
  );
}
