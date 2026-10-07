'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { shopsApi } from '@/lib/api/shops.api';
import type { ShopSettingsDTO } from '@/types/shop';

function RiskSettingsInner({
  settings,
  onSaved,
}: {
  settings: ShopSettingsDTO;
  onSaved: () => void;
}) {
  const t = useTranslations('settings.risk');
  const { shopId } = useCurrentShop();

  const [mediumThreshold, setMediumThreshold] = useState<number>(
    settings.riskMediumThreshold ?? 40
  );
  const [highThreshold, setHighThreshold] = useState<number>(
    settings.riskHighThreshold ?? 70
  );
  const [autoCheckOnConfirm, setAutoCheckOnConfirm] = useState<boolean>(
    settings.riskAutoCheckOnConfirm ?? false
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediumThreshold >= highThreshold) {
      toast.error(t('thresholdOrderError'));
      return;
    }
    setSaving(true);
    try {
      await shopsApi.updateSettings(shopId!, {
        riskMediumThreshold: mediumThreshold,
        riskHighThreshold: highThreshold,
        riskAutoCheckOnConfirm: autoCheckOnConfirm,
      });
      toast.success(t('saved'));
      onSaved();
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-2xl border bg-card p-6 shadow-xs"
      >
        {/* Auto check toggle */}
        <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <label
                htmlFor="auto-check-toggle"
                className="text-sm font-semibold text-foreground cursor-pointer"
              >
                {t('autoCheckOnConfirmLabel')}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('autoCheckOnConfirmDesc')}
            </p>
          </div>

          <input
            id="auto-check-toggle"
            type="checkbox"
            checked={autoCheckOnConfirm}
            onChange={(e) => setAutoCheckOnConfirm(e.target.checked)}
            className="size-5 rounded border-border text-primary focus:ring-primary/20 mt-1 cursor-pointer"
          />
        </div>

        {/* Threshold sliders / inputs */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Shield size={16} />
            <span>{t('thresholdsTitle')}</span>
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="medium-threshold"
                className="text-xs font-medium text-foreground"
              >
                {t('mediumThresholdLabel')} (0-100)
              </label>
              <input
                id="medium-threshold"
                type="number"
                min={1}
                max={99}
                value={mediumThreshold}
                onChange={(e) => setMediumThreshold(Number(e.target.value))}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground">
                {t('mediumThresholdHint', { value: mediumThreshold })}
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="high-threshold"
                className="text-xs font-medium text-foreground"
              >
                {t('highThresholdLabel')} (0-100)
              </label>
              <input
                id="high-threshold"
                type="number"
                min={2}
                max={100}
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground">
                {t('highThresholdHint', { value: highThreshold })}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/40 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('thresholdExplanation', {
                medium: mediumThreshold,
                high: highThreshold,
              })}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
}

export default function RiskSettingsForm() {
  const { shopId } = useCurrentShop();

  const query = useQuery({
    queryKey: ['settings', shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });

  if (query.isPending || !query.data) return null;

  return (
    <RiskSettingsInner
      settings={query.data}
      onSaved={() => void query.refetch()}
    />
  );
}
