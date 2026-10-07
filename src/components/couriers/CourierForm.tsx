'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Field } from '@/components/common/Field';
import { CourierCredentialsForm } from './CourierCredentialsForm';
import {
  useCreateCourier,
  useTestCourier,
  useUpdateCourier,
} from '@/hooks/queries/useCouriers';
import type { CourierConnectionDTO, CourierProvider } from '@/types/courier';
import { formatMoney } from '@/lib/money';

interface CourierFormProps {
  connection?: CourierConnectionDTO | null;
  open: boolean;
  onClose: () => void;
}

const PROVIDERS: { id: CourierProvider; name: string; description: string }[] = [
  {
    id: 'STEADFAST',
    name: 'Steadfast Courier',
    description: 'Fast delivery across 64 districts with bulk booking support.',
  },
  {
    id: 'PATHAO',
    name: 'Pathao Courier',
    description: 'Same day and next day delivery with automated store pickup.',
  },
  {
    id: 'REDX',
    name: 'RedX Delivery',
    description: 'Reliable nationwide parcel delivery with real-time tracking.',
  },
];

export function CourierForm({ connection, open, onClose }: CourierFormProps) {
  const t = useTranslations('couriers.form');
  const createMutation = useCreateCourier();
  const updateMutation = useUpdateCourier();
  const testMutation = useTestCourier();

  const isEditing = Boolean(connection);
  const [provider, setProvider] = useState<CourierProvider>(
    connection?.provider || 'STEADFAST',
  );
  const [name, setName] = useState(connection?.name || 'Steadfast Courier');
  const [isDefault, setIsDefault] = useState(connection?.isDefault || false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, unknown>>(
    connection?.settings || {},
  );
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    balancePaisa?: number;
  } | null>(null);

  if (!open) return null;

  const handleProviderSelect = (p: CourierProvider) => {
    setProvider(p);
    if (!isEditing) {
      if (p === 'STEADFAST') setName('Steadfast Courier');
      if (p === 'PATHAO') setName('Pathao Courier');
      if (p === 'REDX') setName('RedX Delivery');
    }
    setCredentials({});
    setSettings({});
    setTestResult(null);
  };

  const handleTestExisting = async () => {
    if (!connection) return;
    try {
      const res = await testMutation.mutateAsync(connection.id);
      setTestResult(res);
      if (res.ok) {
        toast.success(
          res.balancePaisa !== undefined
            ? `${res.message} (${t('balance')}: ${formatMoney(res.balancePaisa)})`
            : res.message,
        );
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error(t('testFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    try {
      if (isEditing && connection) {
        // Clean empty credentials
        const cleanedCreds: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(credentials)) {
          if (v && v.trim()) cleanedCreds[k] = v.trim();
        }

        await updateMutation.mutateAsync({
          courierId: connection.id,
          input: {
            name: name.trim(),
            ...(Object.keys(cleanedCreds).length > 0
              ? { credentials: cleanedCreds }
              : {}),
            settings,
            isDefault,
          },
        });
        toast.success(t('updatedSuccess'));
      } else {
        await createMutation.mutateAsync({
          provider,
          name: name.trim(),
          credentials,
          settings,
          isDefault,
        });
        toast.success(t('createdSuccess'));
      }
      onClose();
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? t('editTitle') : t('newTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isEditing && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('selectProvider')}
              </label>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {PROVIDERS.map((p) => {
                  const isSelected = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderSelect(p.id)}
                      className={`flex flex-col rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {p.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Field
            label={t('connectionName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Steadfast Main Account"
            required
          />

          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="size-4 rounded-sm border-primary text-primary accent-primary"
              />
              <span>{t('isDefaultLabel')}</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('isDefaultDescription')}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-semibold">
              {t('credentialsHeader', { provider })}
            </h3>
            <CourierCredentialsForm
              provider={provider}
              credentials={credentials}
              settings={settings}
              onCredentialsChange={setCredentials}
              onSettingsChange={setSettings}
              isEditing={isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
              <div>
                <p className="text-xs font-medium">{t('testConnectionTitle')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('testConnectionDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestExisting}
                disabled={testMutation.isPending}
                className="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {testMutation.isPending ? t('testing') : t('testNow')}
              </button>
            </div>
          )}

          {testResult && (
            <div
              className={`rounded-xl border p-3 text-xs ${
                testResult.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300'
              }`}
            >
              <p className="font-semibold">{testResult.message}</p>
              {testResult.balancePaisa !== undefined && (
                <p className="mt-1">
                  {t('balance')}: {formatMoney(testResult.balancePaisa)}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
