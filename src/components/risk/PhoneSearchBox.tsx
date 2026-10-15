'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2, Phone, Shield } from 'lucide-react';

interface PhoneSearchBoxProps {
  onSearch: (phone: string, checkFraudbd?: boolean) => void;
  isLoading?: boolean;
  initialPhone?: string;
  hasFraudbdKey?: boolean;
  className?: string;
}

export function PhoneSearchBox({
  onSearch,
  isLoading = false,
  initialPhone = '',
  hasFraudbdKey = false,
  className = '',
}: PhoneSearchBoxProps) {
  const t = useTranslations('risk');
  const [phone, setPhone] = useState(initialPhone);
  const [checkFraudbd, setCheckFraudbd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/[\s\-()]/g, '');
    if (!clean) {
      setError(t('enterPhonePrompt'));
      return;
    }

    // Basic BD phone validation: 11 digits starting with 01 or 13 digits with +8801
    const bdRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
    if (!bdRegex.test(clean)) {
      setError(t('invalidPhoneFormat'));
      return;
    }

    setError(null);
    if (checkFraudbd) {
      onSearch(clean, true);
    } else {
      onSearch(clean);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full space-y-3 ${className}`}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Phone size={16} />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('searchPlaceholder')}
            className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm font-medium outline-hidden transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              error ? 'border-rose-500' : 'border-border'
            }`}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          <span>{isLoading ? t('checking') : t('checkButton')}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checkFraudbd}
            onChange={(e) => setCheckFraudbd(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Shield size={13} className="text-primary" />
            <span>Include FraudBD check (Uses 1 API credit)</span>
          </span>
          {!hasFraudbdKey && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Key not set
            </span>
          )}
        </label>
        <span className="text-[11px] text-muted-foreground/80">
          Format: 01XXXXXXXXX or +8801XXXXXXXXX
        </span>
      </div>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </form>
  );
}
