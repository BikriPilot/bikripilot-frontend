'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { riskApi } from '@/lib/api/risk.api';
import { RiskDetails } from './RiskDetails';
import { PhoneSearchBox } from './PhoneSearchBox';

interface RiskCheckDialogProps {
  open: boolean;
  onClose: () => void;
  phone?: string;
  orderId?: string;
}

export function RiskCheckDialog({
  open,
  onClose,
  phone: initialPhone = '',
  orderId,
}: RiskCheckDialogProps) {
  const t = useTranslations('risk');
  const { shopId } = useCurrentShop();
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [forceKey, setForceKey] = useState(0);

  const phoneToCheck = searchedPhone ?? initialPhone;

  const query = useQuery({
    queryKey: ['risk-check-dialog', shopId, phoneToCheck, forceKey],
    queryFn: () =>
      riskApi.check(shopId!, {
        phone: phoneToCheck,
        orderId,
        forceRefresh: forceKey > 0,
      }),
    enabled: Boolean(open && shopId && phoneToCheck),
  });

  if (!open) return null;

  const handleSearch = (phone: string) => {
    setSearchedPhone(phone);
  };

  const handleRefresh = () => {
    setForceKey((k) => k + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-dialog-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="risk-dialog-title" className="text-base font-bold">
                {t('dialogTitle')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('dialogSubtitle')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          <PhoneSearchBox
            onSearch={handleSearch}
            isLoading={query.isFetching}
            initialPhone={phoneToCheck}
          />

          {query.isPending && phoneToCheck && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium">{t('analyzingRisk')}</p>
            </div>
          )}

          {query.data && !query.isPending && (
            <RiskDetails
              data={query.data}
              onRefresh={handleRefresh}
              isRefreshing={query.isFetching}
            />
          )}
        </div>
      </div>
    </div>
  );
}
