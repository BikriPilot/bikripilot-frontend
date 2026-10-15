'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  PlugZap,
  Clock,
  Search,
} from 'lucide-react';
import type { RiskCheckDTO, RiskRecommendation } from '@/types/risk';
import { RiskBadge } from './RiskBadge';
import { shopsApi } from '@/lib/api/shops.api';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface RiskDetailsProps {
  data?: RiskCheckDTO | null;
  hasSearched?: boolean;
  searchedPhone?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onCheckFraudbd?: () => void;
  isCheckingFraudbd?: boolean;
  onKeySaved?: () => void;
  isCourierConnected?: boolean;
  activeCourierProvider?: string;
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
  hasSearched = false,
  searchedPhone = '',
  onRefresh,
  isRefreshing = false,
  onCheckFraudbd,
  isCheckingFraudbd = false,
  onKeySaved,
  isCourierConnected = false,
  activeCourierProvider = 'STEADFAST',
}: RiskDetailsProps) {
  const t = useTranslations('risk');
  const tRec = useTranslations('risk.recommendations');
  const tReasons = useTranslations('risk.reasons');
  const { shopId } = useCurrentShop();

  const [fraudbdKeyInput, setFraudbdKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyEditor, setShowKeyEditor] = useState(false);

  // Active verified data or defaults
  const activePhone = data?.phone || searchedPhone;
  const score = data?.score ?? 0;
  const level = data?.level ?? 'UNKNOWN';
  const recommendation = data?.recommendation ?? 'ACCEPT_COD';
  const reasons = data?.reasons ?? [];

  const recConfig =
    RECOMMENDATION_STYLES[recommendation] || RECOMMENDATION_STYLES.MANUAL_REVIEW;
  const RecIcon = recConfig.icon;

  // Courier statistics
  const courierTotal = data?.courier?.total ?? data?.external?.total ?? 0;
  const courierDelivered = data?.courier?.delivered ?? data?.external?.delivered ?? 0;
  const courierCancelled = data?.courier?.cancelled ?? data?.external?.cancelled ?? 0;

  // Platform network statistics
  const platformTotal = data?.network?.total ?? 0;
  const platformDelivered = data?.network?.delivered ?? 0;
  const platformReturned = data?.network?.returned ?? 0;
  const platformCancelled = data?.network?.cancelled ?? 0;
  const platformNegative = platformReturned + platformCancelled;

  // Combined statistics
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

  // Internal shop history statistics
  const shopOrders = data?.internal?.orders ?? data?.internal?.total ?? 0;
  const shopDelivered = data?.internal?.delivered ?? 0;
  const shopReturned = data?.internal?.returned ?? 0;
  const shopCancelled = data?.internal?.cancelled ?? 0;
  const shopSuccessPercent =
    shopDelivered + shopReturned > 0
      ? Math.round((100 * shopDelivered) / (shopDelivered + shopReturned))
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

  const hasFraudbd = Boolean(data?.hasFraudbdKey);
  const fraudbdReport = data?.fraudbd;
  const isCourierLive =
    isCourierConnected ||
    data?.courier?.provider === 'STEADFAST' ||
    (data?.courier?.total ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. TOP BANNER: Score, Verification Badge & Assessment Reasons     */}
      {/* ================================================================= */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Score Circle / Box */}
            <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-muted/60 border font-mono">
              {hasSearched ? (
                <>
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold ${
                      score <= 30
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : score <= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {score}
                  </span>
                  <span className="absolute bottom-1 text-[10px] font-medium text-muted-foreground">
                    / 100
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-muted-foreground/70">
                    --
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    / 100
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-foreground font-mono">
                  {hasSearched && activePhone
                    ? activePhone
                    : t('noCustomerChecked')}
                </h3>

                {hasSearched ? (
                  <>
                    <RiskBadge level={level} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>{t('verifiedProfile')}</span>
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border">
                    <Clock size={12} />
                    <span>{t('readyToVerify')}</span>
                  </span>
                )}
              </div>

              {hasSearched ? (
                <div
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold shadow-2xs ${recConfig.bg} ${recConfig.border} ${recConfig.text}`}
                >
                  <RecIcon size={14} />
                  <span>{tRec(recommendation)}</span>
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {t('searchPromptDesc')}
                </p>
              )}
            </div>
          </div>

          {/* Action Button: Re-check / Refresh */}
          {hasSearched && onRefresh && (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCw
                  size={14}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                <span>{isRefreshing ? t('checking') : t('checkAgain')}</span>
              </button>
              {data?.cached && (
                <span className="text-[11px] text-muted-foreground">
                  {t('cachedNotice')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assessment Factors Chips */}
        {hasSearched && (
          <div className="mt-5 border-t pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('assessmentFactors')}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {reasons.length > 0 ? (
                reasons.map((reason) => {
                  const label = tReasons.has(reason) ? tReasons(reason) : reason;
                  return (
                    <span
                      key={reason}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-muted/80 px-2.5 py-1 text-xs font-medium text-foreground border border-border/50"
                    >
                      <Info size={12} className="text-muted-foreground" />
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={13} />
                  <span>{t('verifiedSafeNotice')}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT GRID                                       */}
      {/* ================================================================= */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* =============================================================== */}
        {/* LEFT COLUMN: Combined Platform + Courier Delivery Stats         */}
        {/* =============================================================== */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 1: Platform & Courier Delivery History (Grand Combined KPI) */}
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

              {hasSearched ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border">
                  <span>Auto Ready</span>
                </span>
              )}
            </div>

            {/* Combined 4-tile summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col justify-between rounded-xl border bg-muted/40 p-3.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t('combinedTotalOrders')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  {combinedTotal}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-3.5">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {t('combinedReceived')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                  {combinedDelivered}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-rose-500/5 border-rose-500/20 p-3.5">
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                  {t('combinedCancelled')}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                  {combinedCancelledOrReturned}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-primary/5 border-primary/20 p-3.5">
                <span className="text-[11px] font-medium text-primary">
                  {t('combinedSuccessScore')}
                </span>
                <span className="mt-2 text-2xl font-extrabold tracking-tight text-primary font-mono">
                  {combinedSuccessPercent !== null
                    ? `${combinedSuccessPercent}%`
                    : 'N/A'}
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

          {/* Underneath: 2 Sub-cards Side by Side (Platform Network Orders & Connected Courier) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sub-card 1: Platform Network Orders */}
            <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Network size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-sm truncate">
                    {t('platformStatsTitle')}
                  </h5>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t('networkShopsCount', { count: data?.network?.shops ?? 0 })}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                  <span className="font-semibold font-mono">{platformTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {platformDelivered}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('returned')}</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    {platformReturned}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('cancelled')}</span>
                  <span className="font-semibold font-mono">{platformCancelled}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-semibold">
                  <span className="text-muted-foreground">Network Success Rate</span>
                  <span className="text-primary font-mono">
                    {platformSuccessPercent !== null ? `${platformSuccessPercent}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-card 2: Connected Courier (Steadfast) - IDENTICAL DESIGN */}
            <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <Truck size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-sm truncate">
                        {t('courierStatsTitle')}
                      </h5>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {isCourierLive
                          ? t('courierConnected')
                          : activeCourierProvider === 'STEADFAST'
                            ? 'Steadfast Connection'
                            : `${activeCourierProvider} Connection`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${
                      isCourierLive
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {isCourierLive ? (
                      <>
                        <CheckCircle2 size={10} />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={10} />
                        <span>{t('courierDisconnected')}</span>
                      </>
                    )}
                  </span>
                </div>

                {isCourierLive ? (
                  /* Connected Courier Live Stats */
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('summary.totalOrders')}</span>
                      <span className="font-semibold font-mono">{courierTotal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('summary.receivedOrders')}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {courierDelivered}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('cancelled')}</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                        {courierCancelled}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t font-semibold">
                      <span className="text-muted-foreground">Courier Success Rate</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono">
                        {courierSuccessPercent !== null ? `${courierSuccessPercent}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Courier Disconnected State: Action Card with Connect API Button */
                  <div className="space-y-3 py-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('noCourierConnected')}
                    </p>
                    <Link
                      href="/dashboard/couriers"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <PlugZap size={14} />
                      <span>{t('connectCourierApi')}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT COLUMN: FraudBD Database & Your Shop History              */}
        {/* =============================================================== */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: FraudBD Community Database */}
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
                            <p className="mt-1 font-bold text-foreground font-mono">
                              {fraudbdReport.total}
                            </p>
                          </div>
                          <div className="rounded-lg bg-background p-2.5 border">
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              {t('fraudbdSuccess')}
                            </span>
                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {fraudbdReport.delivered}
                            </p>
                          </div>
                          <div className="rounded-lg bg-background p-2.5 border">
                            <span className="text-[11px] text-rose-600 dark:text-rose-400">
                              {t('fraudbdCancelled')}
                            </span>
                            <p className="mt-1 font-bold text-rose-600 dark:text-rose-400 font-mono">
                              {fraudbdReport.cancelled}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 text-xs">
                          <span className="text-muted-foreground">{t('fraudbdSuccessScore')}</span>
                          <span className="font-bold text-primary font-mono">
                            {fraudbdReport.successPercent !== null && fraudbdReport.successPercent !== undefined
                              ? `${fraudbdReport.successPercent}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Re-check FraudBD Button (Operates independently) */}
                    {onCheckFraudbd && (
                      <button
                        type="button"
                        onClick={onCheckFraudbd}
                        disabled={isCheckingFraudbd || !activePhone}
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
                        disabled={isCheckingFraudbd || !activePhone}
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

          {/* Card 2: Your Shop History (DIRECTLY UNDERNEATH FRAUDBD) */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Store size={18} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-foreground">
                    {t('thisShopTitle')}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    {t('thisShopSubtitle')}
                  </p>
                </div>
              </div>

              {data?.internal?.isBlocked && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 border border-rose-500/20">
                  <XCircle size={13} />
                  <span>{t('blockedInYourShop')}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl bg-muted/40 p-3 border">
                <span className="text-muted-foreground text-[11px]">Shop Orders</span>
                <p className="mt-1.5 font-bold text-lg text-foreground font-mono">
                  {shopOrders}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                  Delivered
                </span>
                <p className="mt-1.5 font-bold text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                  {shopDelivered}
                </p>
              </div>

              <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3">
                <span className="text-rose-700 dark:text-rose-400 text-[11px]">
                  Returned
                </span>
                <p className="mt-1.5 font-bold text-lg text-rose-600 dark:text-rose-400 font-mono">
                  {shopReturned}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs border-t">
              <span className="text-muted-foreground">Shop Success Rate</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {shopSuccessPercent !== null ? `${shopSuccessPercent}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
