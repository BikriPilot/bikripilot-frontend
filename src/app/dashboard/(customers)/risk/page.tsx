'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, History, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { PhoneSearchBox } from '@/components/risk/PhoneSearchBox';
import { RiskDetails } from '@/components/risk/RiskDetails';
import { RecentChecksTable } from '@/components/risk/RecentChecksTable';
import { useRiskHistory, useCheckRiskMutation } from '@/hooks/queries/useRisk';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { shopsApi } from '@/lib/api/shops.api';

function RiskCheckContent() {
  const t = useTranslations('risk');
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [activePhone, setActivePhone] = useState<string>(phoneParam);
  const [includeFraudbd, setIncludeFraudbd] = useState(false);

  const historyQuery = useRiskHistory({ limit: 15 });
  const checkMutation = useCheckRiskMutation();

  const settingsQuery = useQuery({
    queryKey: ['settings', shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });

  const handleSearch = (phone: string, checkFraudbd = false) => {
    setActivePhone(phone);
    setIncludeFraudbd(checkFraudbd);

    checkMutation.mutate(
      {
        phone,
        checkFraudbd,
        forceRefresh: true,
      },
      {
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err as { message?: string })?.message ||
            t('checkFailed');
          toast.error(msg);
        },
      },
    );
  };

  useEffect(() => {
    if (phoneParam && !checkMutation.data && !checkMutation.isPending) {
      handleSearch(phoneParam, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneParam]);

  const handleRefresh = () => {
    if (!activePhone) return;
    handleSearch(activePhone, includeFraudbd);
  };

  const handleCheckFraudbd = () => {
    if (!activePhone) return;
    handleSearch(activePhone, true);
  };

  const handleKeySaved = () => {
    void queryClient.invalidateQueries({ queryKey: ['settings', shopId] });
    void queryClient.invalidateQueries({ queryKey: ['risk-history', shopId] });
    if (activePhone) {
      handleSearch(activePhone, true);
    }
  };

  const historyItems = historyQuery.data?.data || [];
  const hasFraudbdKey = Boolean(settingsQuery.data?.hasFraudbdKey);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('fraudCheckTitle')}
        description={t('fraudCheckSubtitle')}
      />

      {/* Search Input Box */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
          <ShieldAlert size={18} className="text-primary" />
          <span>{t('checkPhoneTitle')}</span>
        </h3>
        <PhoneSearchBox
          onSearch={handleSearch}
          isLoading={checkMutation.isPending}
          initialPhone={activePhone}
          hasFraudbdKey={hasFraudbdKey}
        />
      </div>

      {/* Error Banner */}
      {checkMutation.isError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={18} />
            <span>{t('checkFailed')}</span>
          </div>
          <p className="mt-1 text-xs opacity-90">
            {(checkMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              (checkMutation.error as { message?: string })?.message ||
              t('checkFailed')}
          </p>
        </div>
      )}

      {/* Result Display: Left (Platform+Courier) & Right (FraudBD) */}
      {checkMutation.data && (
        <RiskDetails
          data={checkMutation.data}
          onRefresh={handleRefresh}
          isRefreshing={checkMutation.isPending}
          onCheckFraudbd={handleCheckFraudbd}
          isCheckingFraudbd={checkMutation.isPending && includeFraudbd}
          onKeySaved={handleKeySaved}
        />
      )}

      {/* Recent Checks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <History size={18} className="text-muted-foreground" />
            <span>{t('recentChecksTitle')}</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {t('recentChecksCount', { count: historyItems.length })}
          </span>
        </div>

        <RecentChecksTable
          items={historyItems}
          onSelectPhone={(phone) => handleSearch(phone, false)}
          isLoading={historyQuery.isLoading}
        />
      </div>
    </div>
  );
}

export default function RiskCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-14 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      }
    >
      <RiskCheckContent />
    </Suspense>
  );
}
