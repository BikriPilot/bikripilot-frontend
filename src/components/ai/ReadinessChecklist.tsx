'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle2, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAiReadiness } from '@/hooks/queries/useAi';
import type { AiReadinessItemKey } from '@/types/ai';

const ITEM_LINKS: Record<AiReadinessItemKey, string> = {
  channel_connected: '/dashboard/settings/channels',
  business_info: '/dashboard/ai',
  products_with_price: '/dashboard/products',
  delivery_charges: '/dashboard/settings/delivery',
  policy: '/dashboard/ai/knowledge',
  faq: '/dashboard/ai/knowledge',
};

export function ReadinessChecklist() {
  const t = useTranslations('ai');
  const { data: readiness, isLoading } = useAiReadiness();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs animate-pulse">
        <div className="h-5 w-40 rounded-md bg-muted mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  const items = readiness?.items ?? [];
  const completedCount = items.filter((item) => item.done).length;
  const isReady = Boolean(readiness?.ready);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('readinessTitle')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('readinessSubtitle', { count: completedCount, total: items.length })}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isReady
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isReady ? t('readyForAuto') : t('setupInProgress')}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const href = ITEM_LINKS[item.key] ?? '/dashboard/ai';
          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={`truncate ${
                    item.done
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {t(`readinessItems.${item.key}`)}
                </span>
              </div>
              <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span>{item.done ? t('view') : t('configure')}</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
        {t('readinessAutoNote')}
      </div>
    </div>
  );
}
