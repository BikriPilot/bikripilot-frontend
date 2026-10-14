'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, History } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PhoneSearchBox } from '@/components/risk/PhoneSearchBox';
import { RiskDetails } from '@/components/risk/RiskDetails';
import { RecentChecksTable } from '@/components/risk/RecentChecksTable';
import { useRiskHistory } from '@/hooks/queries/useRisk';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { riskApi } from '@/lib/api/risk.api';
import { shopsApi } from '@/lib/api/shops.api';

function RiskCheckContent() {
  const t = useTranslations('risk');
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [includeFraudbd, setIncludeFraudbd] = useState(false);
  const [forceKey, setForceKey] = useState(0);

  const activePhone = searchedPhone ?? phoneParam;

  const historyQuery = useRiskHistory({ limit: 15 });

  const settingsQuery = useQuery({
    queryKey: ['settings', shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });

  const checkQuery = useQuery({
    queryKey: ['risk-page-check', shopId, activePhone, forceKey, includeFraudbd],
    queryFn: () =>
      riskApi.check(shopId!, {
        phone: activePhone,
        forceRefresh: forceKey > 0,
        checkFraudbd: includeFraudbd,
      }),
    enabled: Boolean(shopId && activePhone),
  });

  const handleSearch = (phone: string, checkFraudbd = false) => {
    setSearchedPhone(phone);
    setIncludeFraudbd(checkFraudbd);
  };

  const handleRefresh = () => {
    setForceKey((k) => k + 1);
  };

  const handleCheckFraudbd = () => {
    setIncludeFraudbd(true);
    setForceKey((k) => k + 1);
  };

  const handleKeySaved = () => {
    void queryClient.invalidateQueries({ queryKey: ['settings', shopId] });
    void queryClient.invalidateQueries({ queryKey: ['risk-page-check', shopId] });
    void queryClient.invalidateQueries({ queryKey: ['risk-history', shopId] });
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
          isLoading={checkQuery.isFetching}
          initialPhone={activePhone}
          hasFraudbdKey={hasFraudbdKey}
        />
      </div>

      {/* Result Display: Left (Platform+Courier) & Right (FraudBD) */}
      {checkQuery.data && (
        <RiskDetails
          data={checkQuery.data}
          onRefresh={handleRefresh}
          isRefreshing={checkQuery.isFetching}
          onCheckFraudbd={handleCheckFraudbd}
          isCheckingFraudbd={checkQuery.isFetching && includeFraudbd}
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
