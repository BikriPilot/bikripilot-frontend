'use client';

import { useTranslations } from 'next-intl';
import {
  Activity,
  Bot,
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAiUsage } from '@/hooks/queries/useAi';
import type { AiRunType } from '@/types/ai';

const RUN_TYPE_ICONS: Record<AiRunType, React.ComponentType<{ className?: string }>> = {
  AUTO_REPLY: Bot,
  REPLY_DRAFT: MessageSquare,
  ORDER_EXTRACTION: ShoppingBag,
  COMMENT_REPLY: MessageSquare,
  SUMMARY: Sparkles,
  PLAYGROUND: Activity,
};

export function AiUsageTable() {
  const t = useTranslations('ai');
  const { data: usage, isLoading } = useAiUsage();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 rounded-2xl bg-muted/60" />
          <div className="h-32 rounded-2xl bg-muted/60" />
          <div className="h-32 rounded-2xl bg-muted/60" />
        </div>
        <div className="h-64 rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (!usage) return null;

  const used = usage.used;
  const limit = usage.limit ?? 0;
  const isUnlimited = usage.unlimited;
  const percentUsed = isUnlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  const runTypes: AiRunType[] = [
    'AUTO_REPLY',
    'REPLY_DRAFT',
    'ORDER_EXTRACTION',
    'COMMENT_REPLY',
    'SUMMARY',
    'PLAYGROUND',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('usageTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('usageSubtitle', { period: usage.period })}
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Quota Meter */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('monthlyUsage')}
            </span>
            <Bot className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {used}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / {isUnlimited ? t('unlimited') : limit}
              </span>
            </div>
            {!isUnlimited && (
              <div className="mt-2.5 space-y-1">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentUsed > 90 ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{percentUsed}% {t('used')}</span>
                  <span>{Math.max(0, limit - used)} {t('remaining')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draft Acceptance Rate */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('draftAcceptanceRate')}
            </span>
            <ThumbsUp className="size-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {usage.draftAcceptanceRate !== null
                ? `${Math.round(usage.draftAcceptanceRate * 100)}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('draftAcceptanceDesc')}
            </p>
          </div>
        </div>

        {/* Blocked Invocations */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t('blockedGuardrails')}
            </span>
            <ShieldAlert className="size-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {usage.blockedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('blockedGuardrailsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Runs by Type Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          {t('runsByTypeTitle')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {runTypes.map((type) => {
            const Icon = RUN_TYPE_ICONS[type] ?? Activity;
            const count = usage.runsByType[type] ?? 0;
            return (
              <div
                key={type}
                className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon className="size-4" />
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {t(`runTypes.${type}`)}
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-foreground">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
