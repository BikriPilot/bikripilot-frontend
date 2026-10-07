'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, History } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PhoneSearchBox } from '@/components/risk/PhoneSearchBox';
import { RiskDetails } from '@/components/risk/RiskDetails';
import { RecentChecksTable } from '@/components/risk/RecentChecksTable';
import { useRiskHistory } from '@/hooks/queries/useRisk';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { riskApi } from '@/lib/api/risk.api';

function RiskCheckContent() {
  const t = useTranslations('risk');
  const { shopId } = useCurrentShop();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [forceKey, setForceKey] = useState(0);

  const activePhone = searchedPhone ?? phoneParam;

  const historyQuery = useRiskHistory({ limit: 15 });

  const checkQuery = useQuery({
    queryKey: ['risk-page-check', shopId, activePhone, forceKey],
    queryFn: () =>
      riskApi.check(shopId!, {
        phone: activePhone,
        forceRefresh: forceKey > 0,
      }),
    enabled: Boolean(shopId && activePhone),
  });

  const handleSearch = (phone: string) => {
    setSearchedPhone(phone);
  };

  const handleRefresh = () => {
    setForceKey((k) => k + 1);
  };

  const historyItems = historyQuery.data?.data || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('pageTitle')}
        description={t('pageDescription')}
      />

      {/* Search Input Box */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span>{t('checkPhoneTitle')}</span>
        </h3>
        <PhoneSearchBox
          onSearch={handleSearch}
          isLoading={checkQuery.isFetching}
          initialPhone={activePhone}
        />
      </div>

      {/* Result Display */}
      {checkQuery.data && (
        <RiskDetails
          data={checkQuery.data}
          onRefresh={handleRefresh}
          isRefreshing={checkQuery.isFetching}
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
          onSelectPhone={handleSearch}
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
