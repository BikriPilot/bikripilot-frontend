'use client';

import { useState, useEffect } from 'react';
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
  Search,
  Trash2,
} from 'lucide-react';
import type { RiskCheckDTO } from '@/types/risk';
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
  hasFraudbdKey?: boolean;
  fraudbdEnabled?: boolean;
  onSearch?: (phone: string, checkFraudbd?: boolean) => void;
  isSearching?: boolean;
}

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
  hasFraudbdKey: hasFraudbdKeyProp,
  fraudbdEnabled = true,
  onSearch,
  isSearching = false,
}: RiskDetailsProps) {
  const t = useTranslations('risk');
  const tReasons = useTranslations('risk.reasons');
  const { shopId } = useCurrentShop();

  const [searchInput, setSearchInput] = useState(searchedPhone || '');
  const [includeFraudbdInSearch, setIncludeFraudbdInSearch] = useState(false);
  const [fraudbdKeyInput, setFraudbdKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyEditor, setShowKeyEditor] = useState(false);

  // Keep search input synced when searchedPhone changes from outside
  useEffect(() => {
    if (searchedPhone) {
      setSearchInput(searchedPhone);
    }
  }, [searchedPhone]);

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    onSearch?.(clean, includeFraudbdInSearch && fraudbdEnabled && hasFraudbd);
  };

  // Active verified data or defaults
  const activePhone = data?.phone || searchedPhone;
  const score = data?.score ?? 0;
  const reasons = data?.reasons ?? [];

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

  // Handle deleting FraudBD API Key
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const handleDeleteFraudbdKey = async () => {
    if (!shopId) return;
    if (!window.confirm(t('confirmDeleteKey'))) return;
    setIsDeletingKey(true);
    try {
      await shopsApi.updateSettings(shopId, { fraudbdApiKey: '' });
      toast.success(t('fraudbdKeyDeleted'));
      onKeySaved?.();
    } catch {
      toast.error(t('fraudbdKeyDeleteFailed'));
    } finally {
      setIsDeletingKey(false);
    }
  };

  // Immediate FraudBD connection status directly from shop settings or active check data
  const hasFraudbd = Boolean(hasFraudbdKeyProp ?? data?.hasFraudbdKey);
  const fraudbdReport = data?.fraudbd;
  const fraudbdDelivered = fraudbdReport && !fraudbdReport.error ? (fraudbdReport.delivered ?? 0) : 0;
  const fraudbdCancelled = fraudbdReport && !fraudbdReport.error ? (fraudbdReport.cancelled ?? 0) : 0;
  const fraudbdTotal = fraudbdReport && !fraudbdReport.error ? (fraudbdReport.total ?? 0) : 0;

  // Total statistics combined across all 3 sources (Platform, Courier, FraudBD)
  const totalDeliveredAcrossAll = platformDelivered + courierDelivered + fraudbdDelivered;
  const totalFailedAcrossAll = platformNegative + courierCancelled + fraudbdCancelled;
  const totalParcelsAcrossAll = totalDeliveredAcrossAll + totalFailedAcrossAll;
  const overallSuccessPercent =
    totalParcelsAcrossAll > 0
      ? Math.round((100 * totalDeliveredAcrossAll) / totalParcelsAcrossAll)
      : null;

  const isCourierLive =
    isCourierConnected ||
    data?.courier?.provider === 'STEADFAST' ||
    (data?.courier?.total ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. TOP CARD: Search Input on Left, Verified Score on Right       */}
      {/* ================================================================= */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column (col-span-7): Phone Search Input + Indicator + Button */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Search size={14} className="text-primary" />
                <span>{t('checkPhoneTitle')}</span>
              </label>
              <form onSubmit={handleTopSearchSubmit} className="flex items-center gap-2">
                <input
                  type="tel"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-mono outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  {isSearching ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      <span>{t('checking')}</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>{t('searchBtn')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sub-row: FraudBD checkbox toggle only (badge removed as it's already in FraudBD card) */}
            <div className="flex items-center text-xs pt-1">
              <label
                htmlFor="check-fraudbd-search-toggle"
                className={`inline-flex items-center gap-2 cursor-pointer select-none ${
                  !fraudbdEnabled || !hasFraudbd
                    ? 'opacity-60 cursor-not-allowed text-muted-foreground'
                    : 'text-foreground hover:text-primary transition-colors'
                }`}
              >
                <input
                  id="check-fraudbd-search-toggle"
                  type="checkbox"
                  checked={includeFraudbdInSearch && fraudbdEnabled && hasFraudbd}
                  disabled={!fraudbdEnabled || !hasFraudbd}
                  onChange={(e) => setIncludeFraudbdInSearch(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="font-medium text-xs">
                  {!fraudbdEnabled
                    ? t('checkFraudbdCheckboxDisabled')
                    : !hasFraudbd
                      ? t('checkFraudbdNoKey')
                      : t('checkFraudbdCheckbox')}
                </span>
              </label>
            </div>
          </div>

          {/* Right Column (col-span-5): Search state & Overall Success Score across all 3 */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {hasSearched ? t('customerPhoneLabel') : 'Status'}
                </span>
                <p className="text-sm font-bold text-foreground font-mono">
                  {isSearching ? (
                    <span className="text-primary flex items-center gap-1.5 text-xs">
                      <RotateCw size={13} className="animate-spin" />
                      <span>{t('searchingTarget')}</span>
                    </span>
                  ) : hasSearched && activePhone ? (
                    activePhone
                  ) : (
                    <span className="text-muted-foreground font-sans font-normal text-xs">
                      {t('noCustomerChecked')}
                    </span>
                  )}
                </p>
                {hasSearched && (
                  <p className="text-[11px] text-muted-foreground">
                    {totalDeliveredAcrossAll} delivered / {totalParcelsAcrossAll} total parcels
                  </p>
                )}
              </div>

              {/* Overall Success Score KPI Box */}
              <div className="flex flex-col items-center justify-center rounded-2xl border bg-muted/30 px-4 py-2.5 min-w-[110px] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('overallSuccessScore')}
                </span>
                <span
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    !hasSearched || overallSuccessPercent === null
                      ? 'text-muted-foreground/60'
                      : overallSuccessPercent >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : overallSuccessPercent >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {hasSearched
                    ? overallSuccessPercent !== null
                      ? `${overallSuccessPercent}%`
                      : 'N/A'
                    : '--'}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">
                  {hasSearched
                    ? totalParcelsAcrossAll > 0
                      ? `${totalDeliveredAcrossAll} / ${totalParcelsAcrossAll} delivered`
                      : '0 orders / No history'
                    : t('awaitingSearch')}
                </span>
              </div>
            </div>
          </div>
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
      {/* 2. ROW 1: Platform & Courier History (Left) + FraudBD (Right)     */}
      {/* Both cards have exact same height via grid & items-stretch        */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Platform & Courier Delivery History (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
            <div className="space-y-5">
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
            </div>

            {/* Privacy Guarantee Note */}
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground mt-4">
              <Lock size={15} className="text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">{t('privacyGuaranteed')}:</strong>{' '}
                {t('privacyDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: FraudBD Community Database (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="space-y-4">
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

                {!fraudbdEnabled ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {t('fraudbdDisabledByAdmin')}
                  </span>
                ) : hasFraudbd ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Key Connected
                  </span>
                ) : null}
              </div>

              {/* If FraudBD is disabled by Platform Admin */}
              {!fraudbdEnabled ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={16} />
                    <span>{t('fraudbdDisabledByAdmin')}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('fraudbdDisabledNotice')}
                  </p>
                </div>
              ) : (!hasFraudbd || showKeyEditor) ? (
                /* Enter or Edit API Key */
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
              ) : (
                /* FraudBD Key Configured View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-3">
                    <span className="font-mono text-[11px] flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Shop API Key: Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDeleteFraudbdKey}
                      disabled={isDeletingKey}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      <span>{isDeletingKey ? t('deletingKey') : t('deleteKey')}</span>
                    </button>
                  </div>

                  {fraudbdReport ? (
                    <div className="space-y-3.5">
                      {fraudbdReport.error ? (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
                          <div className="flex items-center gap-2 font-semibold">
                            <XCircle size={15} />
                            <span>FraudBD API Error</span>
                          </div>
                          <p className="mt-1 text-[11px] opacity-90">{fraudbdReport.error}</p>
                        </div>
                      ) : fraudbdReport.fraudReports > 0 ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-800 dark:text-rose-300 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{t('fraudReportsAlert', { count: fraudbdReport.fraudReports })}</span>
                          </div>
                          <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                            Caution: Other merchants in Bangladesh have registered fraud reports against this customer.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{t('fraudReportsClean')}</span>
                        </div>
                      )}

                      {!fraudbdReport.error && (
                        <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                          <span className="text-xs font-semibold text-foreground">
                            External Courier History (via FraudBD)
                          </span>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg bg-background p-2 border">
                              <span className="text-[10px] text-muted-foreground">
                                {t('fraudbdTotalParcels')}
                              </span>
                              <p className="mt-0.5 font-bold text-foreground font-mono">
                                {fraudbdReport.total}
                              </p>
                            </div>
                            <div className="rounded-lg bg-background p-2 border">
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                {t('fraudbdSuccess')}
                              </span>
                              <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {fraudbdReport.delivered}
                              </p>
                            </div>
                            <div className="rounded-lg bg-background p-2 border">
                              <span className="text-[10px] text-rose-600 dark:text-rose-400">
                                {t('fraudbdCancelled')}
                              </span>
                              <p className="mt-0.5 font-bold text-rose-600 dark:text-rose-400 font-mono">
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

                      {onCheckFraudbd && (
                        <button
                          type="button"
                          onClick={onCheckFraudbd}
                          disabled={isCheckingFraudbd || !activePhone}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <RotateCw size={13} className={isCheckingFraudbd ? 'animate-spin' : ''} />
                          <span>{isCheckingFraudbd ? t('checkingFraudbd') : 'Re-check FraudBD (1 Credit)'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* FraudBD Not Checked Yet in Current Search */
                    <div className="space-y-3.5">
                      <div className="rounded-xl border bg-muted/40 p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Sparkles size={14} className="text-primary" />
                          <span>Credit Protection Active</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
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
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. ROW 2: Sub-Cards (Left col-span-7) + Your Shop History (Right) */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Platform Network Orders & Connected Courier (combined width matches top card) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          {/* Sub-Card 1: Platform Network Orders */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
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
              </div>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t text-xs font-semibold">
              <span className="text-muted-foreground">Network Success Rate</span>
              <span className="text-primary font-mono">
                {platformSuccessPercent !== null ? `${platformSuccessPercent}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Sub-Card 2: Connected Courier (Steadfast) */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
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
                </div>
              ) : (
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

            <div className="flex justify-between items-center pt-2.5 border-t text-xs font-semibold">
              <span className="text-muted-foreground">Courier Success Rate</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {courierSuccessPercent !== null ? `${courierSuccessPercent}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Card 3: Your Shop History (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Store size={16} />
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

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-muted/40 p-2.5 border">
                  <span className="text-muted-foreground text-[10px] block">Shop Orders</span>
                  <p className="mt-1 font-bold text-base text-foreground font-mono">
                    {shopOrders}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block">
                    Delivered
                  </span>
                  <p className="mt-1 font-bold text-base text-emerald-600 dark:text-emerald-400 font-mono">
                    {shopDelivered}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-2.5">
                  <span className="text-rose-700 dark:text-rose-400 text-[10px] block">
                    Returned
                  </span>
                  <p className="mt-1 font-bold text-base text-rose-600 dark:text-rose-400 font-mono">
                    {shopReturned}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t text-xs font-semibold">
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
