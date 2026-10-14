'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
  KeyRound,
  ExternalLink,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { RiskCheckDTO, RiskRecommendation } from '@/types/risk';
import { RiskBadge } from './RiskBadge';
import { shopsApi } from '@/lib/api/shops.api';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface RiskDetailsProps {
  data: RiskCheckDTO;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCheckFraudbd?: () => void;
  isCheckingFraudbd?: boolean;
  onKeySaved?: () => void;
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
  onCheckFraudbd,
  isCheckingFraudbd = false,
  onKeySaved,
}: RiskDetailsProps) {
  const t = useTranslations('risk');
  const tRec = useTranslations('risk.recommendations');
  const tReasons = useTranslations('risk.reasons');
  const { shopId } = useCurrentShop();

  const [fraudbdKeyInput, setFraudbdKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyEditor, setShowKeyEditor] = useState(false);

  const recConfig =
    RECOMMENDATION_STYLES[data.recommendation] ||
    RECOMMENDATION_STYLES.MANUAL_REVIEW;
  const RecIcon = recConfig.icon;

  // Combined Platform + Courier statistics
  const courierTotal = data.courier?.total ?? data.external?.total ?? 0;
  const courierDelivered = data.courier?.delivered ?? data.external?.delivered ?? 0;
  const courierCancelled = data.courier?.cancelled ?? data.external?.cancelled ?? 0;

  const platformTotal = data.network?.total ?? 0;
  const platformDelivered = data.network?.delivered ?? 0;
  const platformReturned = data.network?.returned ?? 0;
  const platformCancelled = data.network?.cancelled ?? 0;
  const platformNegative = platformReturned + platformCancelled;

  const combinedTotal = platformTotal + courierTotal;
  const combinedDelivered = platformDelivered + courierDelivered;
  const combinedCancelledOrReturned = platformNegative + courierCancelled;
  const combinedSuccessPercent =
    combinedDelivered + combinedCancelledOrReturned > 0
      ? Math.round(
          (100 * combinedDelivered) /
            (combinedDelivered + combinedCancelledOrReturned),
        )
      : null;

  const courierSuccessPercent =
    courierDelivered + courierCancelled > 0
      ? Math.round((100 * courierDelivered) / (courierDelivered + courierCancelled))
      : null;

  const platformSuccessPercent =
    platformDelivered + platformNegative > 0
      ? Math.round((100 * platformDelivered) / (platformDelivered + platformNegative))
      : null;

  // Handle saving FraudBD API Key
  const handleSaveFraudbdKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    const cleanKey = fraudbdKeyInput.trim();
    if (!cleanKey) {
      toast.error('Please enter a valid FraudBD API key');
      return;
    }
    setIsSavingKey(true);
    try {
      await shopsApi.updateSettings(shopId, { fraudbdApiKey: cleanKey });
      toast.success(t('fraudbdKeySaved'));
      setFraudbdKeyInput('');
      setShowKeyEditor(false);
      onKeySaved?.();
    } catch {
      toast.error(t('fraudbdKeySaveFailed'));
    } finally {
      setIsSavingKey(false);
    }
  };

  const hasFraudbd = Boolean(data.hasFraudbdKey);
  const fraudbdReport = data.fraudbd;

  return (
    <div className="space-y-6">
      {/* 1. Top Banner: Score, Badge & Recommendation */}
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

              <div
                className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold shadow-2xs ${recConfig.bg} ${recConfig.border} ${recConfig.text}`}
              >
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
                className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
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

        {/* Assessment Reasons */}
        {data.reasons && data.reasons.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('assessmentFactors')}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {data.reasons.map((reason) => {
                const label = tReasons.has(reason) ? tReasons(reason) : reason;
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

      {/* 2. Main 2-Column Responsive Split Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Combined Platform + Courier Delivery Stats   */}
        {/* ========================================================= */}
        <div className="space-y-6 lg:col-span-7">
          {/* Grand Combined KPI Card */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {t('leftSideTitle')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t('leftSideSubtitle')}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} />
                <span>Verified</span>
              </span>
            </div>

            {/* Combined 4-tile summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col justify-between rounded-xl border bg-muted/40 p-3.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t('combinedTotalOrders')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {combinedTotal}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-3.5">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {t('combinedReceived')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {combinedDelivered}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-rose-500/5 border-rose-500/20 p-3.5">
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                  {t('combinedCancelled')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  {combinedCancelledOrReturned}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-primary/5 border-primary/20 p-3.5">
                <span className="text-[11px] font-medium text-primary">
                  {t('combinedSuccessScore')}
                </span>
                <span className="mt-2 text-2xl font-extrabold tracking-tight text-primary">
                  {combinedSuccessPercent !== null ? `${combinedSuccessPercent}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Visual Success Meter Bar */}
            {combinedSuccessPercent !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Delivery Success Confidence</span>
                  <span
                    className={
                      combinedSuccessPercent >= 80
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : combinedSuccessPercent >= 60
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-rose-600 dark:text-rose-400 font-bold'
                    }
                  >
                    {combinedSuccessPercent}% (
                    {combinedSuccessPercent >= 80
                      ? 'Excellent'
                      : combinedSuccessPercent >= 60
                        ? 'Moderate'
                        : 'Risky'}
                    )
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ${
                      combinedSuccessPercent >= 80
                        ? 'bg-emerald-500'
                        : combinedSuccessPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, combinedSuccessPercent)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Privacy Guarantee Note */}
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <Lock size={15} className="text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">{t('privacyGuaranteed')}:</strong>{' '}
                {t('privacyDescription')}
              </p>
            </div>
          </div>

          {/* Sources Detailed Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1. Platform Network Orders */}
            <div className="rounded-2xl border bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Network size={16} />
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{t('platformStatsTitle')}</h5>
                  <p className="text-[11px] text-muted-foreground">
                    {t('networkShopsCount', { count: data.network?.shops ?? 0 })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                  <span className="font-semibold">{platformTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {platformDelivered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('returned')}</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {platformReturned}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cancelled')}</span>
                  <span className="font-semibold">{platformCancelled}</span>
                </div>
                <div className="flex justify-between pt-1 border-t font-semibold">
                  <span className="text-muted-foreground">Network Success Rate</span>
                  <span className="text-primary">
                    {platformSuccessPercent !== null ? `${platformSuccessPercent}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Connected Courier (Steadfast) */}
            <div className="rounded-2xl border bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Truck size={16} />
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{t('courierStatsTitle')}</h5>
                  <p className="text-[11px] text-muted-foreground">
                    {data.courier?.provider === 'STEADFAST'
                      ? 'Live Courier API Synced'
                      : 'Steadfast Connection'}
                  </p>
                </div>
              </div>

              {data.courier?.provider === 'STEADFAST' || courierTotal > 0 ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                    <span className="font-semibold">{courierTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {courierDelivered}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cancelled')}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {courierCancelled}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-semibold">
                    <span className="text-muted-foreground">Courier Success Rate</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {courierSuccessPercent !== null ? `${courierSuccessPercent}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-xs text-muted-foreground leading-relaxed">
                  {t('noCourierConnected')}
                </div>
              )}
            </div>

            {/* 3. Your Shop History (Spans 2 columns if internal orders exist) */}
            <div className="sm:col-span-2 rounded-2xl border bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
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

                {data.internal?.isBlocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 border border-rose-500/20">
                    <XCircle size={13} />
                    <span>{t('blockedInYourShop')}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-muted-foreground text-[11px]">Shop Orders</span>
                  <p className="mt-1 font-bold text-sm text-foreground">
                    {data.internal?.orders ?? data.internal?.total ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 p-2.5">
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    Delivered
                  </span>
                  <p className="mt-1 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {data.internal?.delivered ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-rose-500/5 p-2.5">
                  <span className="text-rose-700 dark:text-rose-400 text-[11px]">
                    Returned
                  </span>
                  <p className="mt-1 font-bold text-sm text-rose-600 dark:text-rose-400">
                    {data.internal?.returned ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: FraudBD API Community History & Reports     */}
        {/* ========================================================= */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {t('rightSideTitle')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t('rightSideSubtitle')}
                  </p>
                </div>
              </div>

              {hasFraudbd && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Key Connected
                </span>
              )}
            </div>

            {/* Condition A: Key NOT configured OR editing key */}
            {(!hasFraudbd || showKeyEditor) && (
              <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <KeyRound size={16} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-foreground">
                      {t('fraudbdNotConfigured')}
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('fraudbdNotConfiguredDesc')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveFraudbdKey} className="space-y-2.5 pt-1">
                  <div className="relative">
                    <input
                      type="password"
                      value={fraudbdKeyInput}
                      onChange={(e) => setFraudbdKeyInput(e.target.value)}
                      placeholder={t('fraudbdKeyPlaceholder')}
                      className="w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-mono outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <a
                      href="https://fraudbd.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <span>Get key at fraudbd.com</span>
                      <ExternalLink size={11} />
                    </a>

                    <div className="flex items-center gap-2">
                      {showKeyEditor && (
                        <button
                          type="button"
                          onClick={() => setShowKeyEditor(false)}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingKey || !fraudbdKeyInput.trim()}
                        className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        {isSavingKey ? t('savingFraudbdKey') : t('saveFraudbdKey')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Condition B: FraudBD Key IS configured */}
            {hasFraudbd && !showKeyEditor && (
              <div className="space-y-4">
                {/* Cost Isolation Notice Badge */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-3">
                  <span className="font-mono text-[11px]">Shop API Key: Active</span>
                  <button
                    type="button"
                    onClick={() => setShowKeyEditor(true)}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Change Key
                  </button>
                </div>

                {/* If FraudBD was checked */}
                {fraudbdReport ? (
                  <div className="space-y-4">
                    {/* 1. Community Fraud Reports Alert */}
                    {fraudbdReport.error ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400">
                        <div className="flex items-center gap-2 font-semibold">
                          <XCircle size={15} />
                          <span>FraudBD API Error</span>
                        </div>
                        <p className="mt-1 text-[11px] opacity-90">{fraudbdReport.error}</p>
                      </div>
                    ) : fraudbdReport.fraudReports > 0 ? (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-800 dark:text-rose-300 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <AlertTriangle size={17} className="text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{t('fraudReportsAlert', { count: fraudbdReport.fraudReports })}</span>
                        </div>
                        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                          Caution: Other merchants in Bangladesh have registered fraud reports against this customer.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold">
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{t('fraudReportsClean')}</span>
                      </div>
                    )}

                    {/* 2. FraudBD Courier History */}
                    {!fraudbdReport.error && (
                      <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5">
                        <span className="text-xs font-semibold text-foreground">
                          External Courier History (via FraudBD)
                        </span>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-lg bg-background p-2.5 border">
                            <span className="text-[11px] text-muted-foreground">
                              {t('fraudbdTotalParcels')}
                            </span>
                            <p className="mt-1 font-bold text-foreground">
                              {fraudbdReport.total}
                            </p>
                          </div>
                          <div className="rounded-lg bg-background p-2.5 border">
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              {t('fraudbdSuccess')}
                            </span>
                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                              {fraudbdReport.delivered}
                            </p>
                          </div>
                          <div className="rounded-lg bg-background p-2.5 border">
                            <span className="text-[11px] text-rose-600 dark:text-rose-400">
                              {t('fraudbdCancelled')}
                            </span>
                            <p className="mt-1 font-bold text-rose-600 dark:text-rose-400">
                              {fraudbdReport.cancelled}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 text-xs">
                          <span className="text-muted-foreground">{t('fraudbdSuccessScore')}</span>
                          <span className="font-bold text-primary">
                            {fraudbdReport.successPercent !== null && fraudbdReport.successPercent !== undefined
                              ? `${fraudbdReport.successPercent}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Re-check FraudBD Button */}
                    {onCheckFraudbd && (
                      <button
                        type="button"
                        onClick={onCheckFraudbd}
                        disabled={isCheckingFraudbd}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <RotateCw size={13} className={isCheckingFraudbd ? 'animate-spin' : ''} />
                        <span>{isCheckingFraudbd ? t('checkingFraudbd') : 'Re-check FraudBD (1 Credit)'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* FraudBD was NOT checked in this search to save credits */
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Sparkles size={14} className="text-primary" />
                        <span>Credit Protection Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('fraudbdSkippedNotice')}
                      </p>
                    </div>

                    {onCheckFraudbd && (
                      <button
                        type="button"
                        onClick={onCheckFraudbd}
                        disabled={isCheckingFraudbd}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                      >
                        <ShieldAlert size={15} className={isCheckingFraudbd ? 'animate-spin' : ''} />
                        <span>{isCheckingFraudbd ? t('checkingFraudbd') : t('checkWithFraudbd')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cost Protection Disclosure */}
            <div className="rounded-xl border bg-muted/20 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <ShieldCheck size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t('fraudbdCostNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
