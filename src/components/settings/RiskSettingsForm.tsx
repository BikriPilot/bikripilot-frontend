'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Shield, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';
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
  const [fraudbdApiKey, setFraudbdApiKey] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediumThreshold >= highThreshold) {
      toast.error(t('thresholdOrderError'));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        riskMediumThreshold: mediumThreshold,
        riskHighThreshold: highThreshold,
        riskAutoCheckOnConfirm: autoCheckOnConfirm,
      };
      if (fraudbdApiKey.trim()) {
        payload.fraudbdApiKey = fraudbdApiKey.trim();
      }
      await shopsApi.updateSettings(shopId!, payload);
      toast.success(t('saved'));
      setFraudbdApiKey('');
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

        {/* FraudBD API Key Config */}
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            <label
              htmlFor="fraudbd-api-key"
              className="text-sm font-semibold text-foreground"
            >
              FraudBD API Key (Isolated per Shop)
            </label>
          </div>
          {settings.fraudbdEnabled === false ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              FraudBD integration is currently disabled platform-wide by platform administrator. Adding API keys is paused.
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure your personal FraudBD API key to query external merchant fraud reports. Cost is strictly billed to your key and only consumed on manual searches.
              </p>
              <input
                id="fraudbd-api-key"
                type="password"
                value={fraudbdApiKey}
                onChange={(e) => setFraudbdApiKey(e.target.value)}
                placeholder={
                  settings.hasFraudbdKey
                    ? settings.fraudbdApiKeyMasked ?? '•••••••• (Connected)'
                    : 'Enter FraudBD API key'
                }
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </>
          )}
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
