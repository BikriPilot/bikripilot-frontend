'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { X, BookOpen, Plus } from 'lucide-react';
import {
  useCreateKnowledge,
  useUpdateKnowledge,
} from '@/hooks/queries/useAi';
import type {
  CreateKnowledgeInput,
  KnowledgeEntryDTO,
  KnowledgeType,
} from '@/types/ai';

interface KnowledgeFormDialogProps {
  entry?: KnowledgeEntryDTO | null;
  open: boolean;
  onClose: () => void;
}

const KNOWLEDGE_TYPES: KnowledgeType[] = [
  'FAQ',
  'DELIVERY',
  'PAYMENT',
  'RETURN_POLICY',
  'ABOUT',
  'OTHER',
];

function KnowledgeFormModalContent({
  entry,
  onClose,
}: {
  entry?: KnowledgeEntryDTO | null;
  onClose: () => void;
}) {
  const t = useTranslations('ai');
  const createMutation = useCreateKnowledge();
  const updateMutation = useUpdateKnowledge();

  const isEditing = Boolean(entry);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [type, setType] = useState<KnowledgeType>(entry?.type ?? 'FAQ');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [content, setContent] = useState(entry?.content ?? '');
  const [keywords, setKeywords] = useState<string[]>(entry?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState('');
  const [isActive, setIsActive] = useState(entry?.isActive ?? true);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      setKeywordInput('');
      return;
    }
    setKeywords([...keywords, trimmed]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error(t('titleAndContentRequired'));
      return;
    }

    const payload: CreateKnowledgeInput = {
      type,
      title: title.trim(),
      content: content.trim(),
      keywords,
      isActive,
    };

    try {
      if (isEditing && entry) {
        await updateMutation.mutateAsync({
          entryId: entry.id,
          input: payload,
        });
        toast.success(t('knowledgeUpdated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('knowledgeCreated'));
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('failedToSaveKnowledge');
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? t('editKnowledgeEntry') : t('addKnowledgeEntry')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('knowledgeDialogSubtitle')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {t('knowledgeTypeLabel')} *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as KnowledgeType)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              {KNOWLEDGE_TYPES.map((tKey) => (
                <option key={tKey} value={tKey}>
                  {t(`knowledgeTypes.${tKey}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded text-primary focus:ring-primary"
              />
              <span>{t('activeInAiPrompt')}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            {t('knowledgeTitleLabel')} *
          </label>
          <input
            type="text"
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('knowledgeTitlePlaceholder')}
            required
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-foreground">
              {t('knowledgeContentLabel')} *
            </label>
            <span className="text-xs font-mono text-muted-foreground">
              {content.length} / 2000
            </span>
          </div>
          <textarea
            value={content}
            maxLength={2000}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('knowledgeContentPlaceholder')}
            required
            rows={5}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            {t('keywordsLabel')}
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder={t('keywordPlaceholder')}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
            >
              <Plus className="size-3.5" />
              <span>{t('add')}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}

export function KnowledgeFormDialog({
  entry,
  open,
  onClose,
}: KnowledgeFormDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <KnowledgeFormModalContent
        key={entry?.id ?? 'new'}
        entry={entry}
        onClose={onClose}
      />
    </div>
  );
}
