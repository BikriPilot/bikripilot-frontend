'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  FileText,
  Save,
  Play,
  AlertTriangle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAiSettings, useUpdateAiSettings } from '@/hooks/queries/useAi';
import { useProducts } from '@/hooks/queries/useProducts';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { ReadinessChecklist } from './ReadinessChecklist';

const MAX_CHARS = 5000;

interface EditorContentProps {
  serverText: string;
  shopId: string | null;
}

function BusinessInfoEditorContent({ serverText, shopId }: EditorContentProps) {
  const t = useTranslations('ai');
  const locale = useLocale();
  const updateSettingsMutation = useUpdateAiSettings();

  const storageKey = shopId ? `bikrio_business_info_draft_${shopId}` : null;

  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const localDraft = localStorage.getItem(storageKey);
        if (localDraft && localDraft !== serverText) {
          return localDraft;
        }
      } catch {
        // ignore
      }
    }
    return serverText;
  });

  const [draftRestored, setDraftRestored] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const localDraft = localStorage.getItem(storageKey);
        return Boolean(localDraft && localDraft !== serverText);
      } catch {
        // ignore
      }
    }
    return false;
  });

  const { data: productsData } = useProducts({ limit: 100 });
  const products = useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray((productsData as { data?: unknown[] }).data)) {
      return (productsData as { data: { name: string; pricePaisa: number }[] }).data;
    }
    return [];
  }, [productsData]);

  const handleTextChange = (newText: string) => {
    if (newText.length > MAX_CHARS) return;
    setText(newText);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, newText);
      } catch {
        // ignore
      }
    }
  };

  const handleInsertTemplate = () => {
    const templateBn = `আমরা কী বিক্রি করি: প্রিমিয়াম পাঞ্জাবি ও টি-শার্ট
দাম: কটন পাঞ্জাবি ৳1250, টি-শার্ট ৳450
সাইজ ও কালার: পাঞ্জাবি (M, L, XL), টি-শার্ট (S, M, L, XL)
ডেলিভারি চার্জ ও সময়: ঢাকার ভিতরে ৳60 (24-48 ঘণ্টা), ঢাকার বাইরে ৳120 (3-5 দিন)
ডেলিভারি শর্ত: সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা আছে
ওয়ারেন্টি ও গ্যারান্টি: রঙের কোনো সমস্যা হলে 7 দিনের মধ্যে পরিবর্তনযোগ্য
রিটার্ন ও এক্সচেঞ্জ: ডেলিভারিম্যানের সামনে চেক করে নিতে পারবেন
পেমেন্ট মাধ্যম: ক্যাশ অন ডেলিভারি অথবা বিকাশ পার্সোনাল 01700000000
দোকানের ঠিকানা ও সময়: সকাল 10টা থেকে রাত 10টা পর্যন্ত`;

    const templateEn = `What we sell: Premium Cotton Panjabi & T-Shirts
Prices: Cotton Panjabi ৳1250, T-Shirt ৳450
Sizes and Colors: Panjabi (M, L, XL), T-Shirt (S, M, L, XL)
Delivery charges & timeline: Inside Dhaka ৳60 (24-48 hrs), Outside Dhaka ৳120 (3-5 days)
Delivery conditions: Cash on delivery available all over Bangladesh
Warranty: Color and fabric defect covered for 7 days
Return and exchange: Check in front of the delivery agent
Payment methods: Cash on delivery or bKash Personal 01700000000
Shop address and hours: 10 AM to 10 PM daily`;

    const template = locale === 'bn' ? templateBn : templateEn;
    if (text.trim().length > 0) {
      if (!window.confirm(t('confirmInsertTemplate'))) {
        return;
      }
    }
    handleTextChange(template);
  };

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        businessInfo: text.trim(),
      });
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
      }
      setDraftRestored(false);
      toast.success(t('businessInfoSaved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('failedToSave');
      toast.error(msg);
    }
  };

  const handleDiscardDraft = () => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    setText(serverText);
    setDraftRestored(false);
    toast.info(t('draftDiscarded'));
  };

  const priceMismatches = useMemo(() => {
    if (!text || products.length === 0) return [];
    const mismatches: { productName: string; textPrice: number; cataloguePrice: number }[] = [];

    const lines = text.split('\n');
    for (const line of lines) {
      for (const prod of products) {
        const prodNameLower = prod.name.toLowerCase();
        if (line.toLowerCase().includes(prodNameLower)) {
          const match = line.match(/(?:৳|tk\.?|taka|টাকা)?\s*(\d{2,6})\s*(?:৳|tk\.?|taka|টাকা)?/i);
          if (match && match[1]) {
            const foundPrice = parseInt(match[1], 10);
            const catPrice = Math.round(prod.pricePaisa / 100);
            if (foundPrice > 0 && catPrice > 0 && foundPrice !== catPrice) {
              mismatches.push({
                productName: prod.name,
                textPrice: foundPrice,
                cataloguePrice: catPrice,
              });
            }
          }
        }
      }
    }
    return mismatches;
  }, [text, products]);

  const charCount = text.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('tellAiAboutBusiness')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('businessInfoDescription')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInsertTemplate}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-input bg-background px-3.5 text-xs font-semibold hover:bg-muted transition-colors"
          >
            <FileText className="size-4 text-primary" />
            <span>{t('insertTemplate')}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={updateSettingsMutation.isPending}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>
              {updateSettingsMutation.isPending ? t('saving') : t('save')}
            </span>
          </button>
        </div>
      </div>

      {draftRestored && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4 shrink-0" />
            <span>{t('draftRestoredNotice')}</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="font-medium underline hover:no-underline"
          >
            {t('discardDraft')}
          </button>
        </div>
      )}

      {priceMismatches.length > 0 && (
        <div className="space-y-2">
          {priceMismatches.map((mismatch, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {t('priceMismatchWarning', {
                  product: mismatch.productName,
                  cataloguePrice: mismatch.cataloguePrice,
                  textPrice: mismatch.textPrice,
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Editor Box */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {t('businessInfoBoxTitle')}
            </span>
            <span
              className={`text-xs font-mono ${
                isNearLimit ? 'text-destructive font-bold' : 'text-muted-foreground'
              }`}
            >
              {charCount} / {MAX_CHARS}
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t('businessInfoPlaceholder')}
            rows={15}
            className="w-full resize-y rounded-xl border border-input bg-background p-4 text-sm font-sans leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {t('businessInfoTip')}
            </p>

            <Link
              href="/dashboard/ai/playground"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <Play className="size-3.5 fill-current" />
              <span>{t('testInPlayground')}</span>
            </Link>
          </div>
        </div>

        {/* Readiness Checklist Card */}
        <div className="space-y-4">
          <ReadinessChecklist />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
              <Sparkles className="size-4" />
              <span>{t('quickTipsTitle')}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
              <li>{t('tipPricesAccurate')}</li>
              <li>{t('tipDeliveryClear')}</li>
              <li>{t('tipReturnPolicy')}</li>
              <li>{t('tipPaymentMethods')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessInfoEditor() {
  const { shopId } = useCurrentShop();
  const { data: settings, isLoading } = useAiSettings();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-60 rounded-md bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-muted/60" />
          <div className="h-80 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  const serverText = settings?.businessInfo ?? '';

  return (
    <BusinessInfoEditorContent
      key={serverText}
      serverText={serverText}
      shopId={shopId ?? null}
    />
  );
}
