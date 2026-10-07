'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  useKnowledge,
  useUpdateKnowledge,
  useDeleteKnowledge,
} from '@/hooks/queries/useAi';
import { KnowledgeFormDialog } from './KnowledgeFormDialog';
import type { KnowledgeEntryDTO, KnowledgeType } from '@/types/ai';

const TABS: { key: 'ALL' | KnowledgeType; labelKey: string }[] = [
  { key: 'ALL', labelKey: 'allTypes' },
  { key: 'FAQ', labelKey: 'knowledgeTypes.FAQ' },
  { key: 'DELIVERY', labelKey: 'knowledgeTypes.DELIVERY' },
  { key: 'PAYMENT', labelKey: 'knowledgeTypes.PAYMENT' },
  { key: 'RETURN_POLICY', labelKey: 'knowledgeTypes.RETURN_POLICY' },
  { key: 'ABOUT', labelKey: 'knowledgeTypes.ABOUT' },
  { key: 'OTHER', labelKey: 'knowledgeTypes.OTHER' },
];

export function KnowledgeList() {
  const t = useTranslations('ai');
  const [activeTab, setActiveTab] = useState<'ALL' | KnowledgeType>('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntryDTO | null>(null);

  const { data: entries = [], isLoading } = useKnowledge(
    activeTab === 'ALL' ? undefined : activeTab,
  );
  const updateMutation = useUpdateKnowledge();
  const deleteMutation = useDeleteKnowledge();

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.keywords.some((kw) => kw.toLowerCase().includes(q)),
    );
  }, [entries, search]);

  const handleToggleActive = async (entry: KnowledgeEntryDTO) => {
    try {
      await updateMutation.mutateAsync({
        entryId: entry.id,
        input: { isActive: !entry.isActive },
      });
      toast.success(
        entry.isActive ? t('knowledgeDeactivated') : t('knowledgeActivated'),
      );
    } catch {
      toast.error(t('failedToUpdateStatus'));
    }
  };

  const handleDelete = async (entry: KnowledgeEntryDTO) => {
    if (!window.confirm(t('confirmDeleteKnowledge', { title: entry.title }))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success(t('knowledgeDeleted'));
    } catch {
      toast.error(t('failedToDeleteKnowledge'));
    }
  };

  const handleEdit = (entry: KnowledgeEntryDTO) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('knowledgeTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('knowledgeSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          <span>{t('addKnowledge')}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchKnowledge')}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Entry Count & Capacity Note */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>{t('entriesCount', { count: filteredEntries.length })}</span>
        <span>{t('maxKnowledgeNotice', { count: entries.length, max: 200 })}</span>
      </div>

      {/* List / Cards */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {search ? t('noMatchingEntries') : t('noKnowledgeEntriesYet')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search
              ? t('tryDifferentSearch')
              : t('noKnowledgeEntriesDesc')}
          </p>
          {!search && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>{t('addFirstEntry')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-muted-foreground/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {t(`knowledgeTypes.${entry.type}`)}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {entry.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleToggleActive(entry)}
                    title={entry.isActive ? t('active') : t('inactive')}
                    className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                      entry.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {entry.isActive ? t('active') : t('inactive')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    title={t('edit')}
                  >
                    <Edit2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(entry)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title={t('delete')}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {entry.keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                  <Tag className="size-3" />
                  {entry.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <KnowledgeFormDialog
        entry={editingEntry}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
      />
    </div>
  );
}
