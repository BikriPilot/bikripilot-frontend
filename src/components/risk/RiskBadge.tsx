'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from 'lucide-react';
import type { RiskLevel } from '@/types/risk';

interface RiskBadgeProps {
  level?: RiskLevel | string | null;
  score?: number | null;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LEVEL_STYLES: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    text: string;
    icon: typeof ShieldCheck;
  }
> = {
  LOW: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: ShieldCheck,
  },
  MEDIUM: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: ShieldAlert,
  },
  HIGH: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    icon: ShieldX,
  },
  UNKNOWN: {
    bg: 'bg-muted',
    border: 'border-border/50',
    text: 'text-muted-foreground',
    icon: HelpCircle,
  },
};

export function RiskBadge({
  level,
  score,
  showScore = false,
  size = 'md',
  className = '',
}: RiskBadgeProps) {
  const t = useTranslations('risk.levels');
  const safeLevel = (level?.toUpperCase() as RiskLevel) || 'UNKNOWN';
  const config = LEVEL_STYLES[safeLevel] || LEVEL_STYLES.UNKNOWN;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{t(safeLevel)}</span>
      {showScore && typeof score === 'number' && (
        <span className="font-semibold opacity-85">({score})</span>
      )}
    </span>
  );
}
