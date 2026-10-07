'use client';

import { useTranslations } from 'next-intl';
import { Eye, Clock } from 'lucide-react';
import type { RiskHistoryItem } from '@/types/risk';
import { RiskBadge } from './RiskBadge';

interface RecentChecksTableProps {
  items: RiskHistoryItem[];
  onSelectPhone: (phone: string) => void;
  isLoading?: boolean;
}

export function RecentChecksTable({
  items,
  onSelectPhone,
  isLoading = false,
}: RecentChecksTableProps) {
  const t = useTranslations('risk');

  const maskPhone = (phone: string) => {
    if (phone.length <= 7) return phone;
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <Clock className="mx-auto size-10 text-muted-foreground/50" />
        <h4 className="mt-3 text-sm font-semibold">{t('noRecentChecks')}</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('noRecentChecksDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t('phoneColumn')}</th>
              <th className="px-4 py-3 font-medium">{t('levelColumn')}</th>
              <th className="px-4 py-3 font-medium">{t('scoreColumn')}</th>
              <th className="px-4 py-3 font-medium">{t('checkedAtColumn')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('actionsColumn')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono font-medium">
                  {maskPhone(item.phone)}
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={item.riskLevel} size="sm" />
                </td>
                <td className="px-4 py-3 font-semibold">
                  <span
                    className={
                      item.riskScore <= 30
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.riskScore <= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {item.riskScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectPhone(item.phone)}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Eye size={12} />
                    <span>{t('viewCheck')}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
