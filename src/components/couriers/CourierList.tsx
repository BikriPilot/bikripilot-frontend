'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState } from '@/components/common/PageStates';
import { CardListSkeleton } from '@/components/common/skeletons';
import { CourierForm } from './CourierForm';
import {
  useCouriers,
  useDeleteCourier,
  useTestCourier,
} from '@/hooks/queries/useCouriers';
import type { CourierConnectionDTO } from '@/types/courier';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/date';

export function CourierList() {
  const t = useTranslations('couriers');
  const { data: connections, isPending, isError, refetch } = useCouriers();
  const deleteMutation = useDeleteCourier();
  const testMutation = useTestCourier();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierConnectionDTO | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyWebhook = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success(t('webhookCopied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTest = async (courier: CourierConnectionDTO) => {
    try {
      const res = await testMutation.mutateAsync(courier.id);
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

  const handleDelete = async (courier: CourierConnectionDTO) => {
    if (!window.confirm(t('deleteConfirm', { name: courier.name }))) return;
    try {
      await deleteMutation.mutateAsync(courier.id);
      toast.success(t('deletedSuccess'));
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  const handleOpenEdit = (courier: CourierConnectionDTO) => {
    setEditingCourier(courier);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCourier(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <button
            type="button"
            onClick={() => {
              setEditingCourier(null);
              setFormOpen(true);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            {t('addCourier')}
          </button>
        }
      />

      {isPending ? (
        <CardListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !connections || connections.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          action={
            <button
              type="button"
              onClick={() => {
                setEditingCourier(null);
                setFormOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Plus size={16} />
              {t('addCourier')}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.provider}
                      </span>
                      {c.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          {t('defaultBadge')}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 truncate text-base font-semibold">{c.name}</h3>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {c.isActive ? t('activeBadge') : t('inactiveBadge')}
                  </span>
                </div>

                {c.maskedKey && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('apiKey')}: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{c.maskedKey}</code>
                  </p>
                )}

                {c.lastVerifiedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('verified')}: {formatDate(c.lastVerifiedAt)}
                  </p>
                )}

                {c.lastError && (
                  <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
                    <p className="font-medium">{t('lastError')}:</p>
                    <p className="mt-0.5 line-clamp-2">{c.lastError}</p>
                  </div>
                )}

                {/* Webhook URL Box */}
                <div className="mt-4 rounded-xl border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t('webhookUrl')}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyWebhook(c.id, c.webhookUrl)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {copiedId === c.id ? (
                        <>
                          <Check size={12} />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          {t('copy')}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 truncate font-mono text-xs text-muted-foreground">{c.webhookUrl}</p>
                  <p className="mt-2 text-[11px] leading-tight text-muted-foreground">
                    {c.provider === 'STEADFAST' && t('steadfastWebhookHint')}
                    {c.provider === 'PATHAO' && t('pathaoWebhookHint')}
                    {c.provider === 'REDX' && t('redxWebhookHint')}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 flex items-center justify-between border-t pt-3">
                <button
                  type="button"
                  onClick={() => void handleTest(c)}
                  disabled={testMutation.isPending}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <RefreshCw size={13} className={testMutation.isPending ? 'animate-spin' : ''} />
                  {t('testPing')}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(c)}
                    className="rounded-lg border border-danger/30 p-1 text-danger hover:bg-danger/10"
                    title={t('delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CourierForm
        open={formOpen}
        connection={editingCourier}
        onClose={handleCloseForm}
      />
    </div>
  );
}
