"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Search, MessageSquareCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSavedReplies, useInboxMutations } from "@/hooks/queries/useInbox";
import { CardListSkeleton } from "@/components/common/skeletons/Skeletons";
import type { SavedReplyDTO } from "@/types/inbox";

export function SavedRepliesTab() {
  const t = useTranslations("inbox");
  const [search, setSearch] = useState("");
  const { data: savedReplies = [], isLoading } = useSavedReplies(search);
  const mutations = useInboxMutations();

  const [editingReply, setEditingReply] = useState<SavedReplyDTO | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formShortcut, setFormShortcut] = useState("");
  const [formText, setFormText] = useState("");

  const handleStartCreate = () => {
    setEditingReply(null);
    setFormTitle("");
    setFormShortcut("");
    setFormText("");
    setIsCreating(true);
  };

  const handleStartEdit = (reply: SavedReplyDTO) => {
    setIsCreating(false);
    setEditingReply(reply);
    setFormTitle(reply.title);
    setFormShortcut(reply.shortcut ?? "");
    setFormText(reply.text);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingReply(null);
    setFormTitle("");
    setFormShortcut("");
    setFormText("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formText.trim()) return;

    try {
      if (isCreating) {
        await mutations.createSavedReply.mutateAsync({
          title: formTitle.trim(),
          shortcut: formShortcut.trim() || undefined,
          text: formText.trim(),
        });
        toast.success(t("savedReplyCreatedToast"));
      } else if (editingReply) {
        await mutations.updateSavedReply.mutateAsync({
          replyId: editingReply.id,
          body: {
            title: formTitle.trim(),
            shortcut: formShortcut.trim() || null,
            text: formText.trim(),
          },
        });
        toast.success(t("savedReplyUpdatedToast"));
      }
      handleCancelForm();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("savedReplySaveFailed");
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDeleteSavedReply"))) return;
    try {
      await mutations.deleteSavedReply.mutateAsync(id);
      toast.success(t("savedReplyDeletedToast"));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("savedReplyDeleteFailed");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("savedReplies")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("savedRepliesDescription")}
          </p>
        </div>
        {!isCreating && !editingReply && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            <span>{t("newSavedReply")}</span>
          </button>
        )}
      </div>

      {/* Inline Create/Edit Form */}
      {(isCreating || editingReply) && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold">
              {isCreating ? t("newSavedReply") : t("editSavedReply")}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("cancel")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                {t("savedReplyTitleLabel")} *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={t("savedReplyTitlePlaceholder")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                {t("savedReplyShortcutLabel")} (e.g. price)
              </label>
              <input
                type="text"
                value={formShortcut}
                onChange={(e) => setFormShortcut(e.target.value)}
                placeholder={t("savedReplyShortcutPlaceholder")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {t("savedReplyTextLabel")} *
            </label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder={t("savedReplyTextPlaceholder")}
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleCancelForm}
              className="rounded-xl border border-input px-3.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={
                mutations.createSavedReply.isPending ||
                mutations.updateSavedReply.isPending
              }
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {t("save")}
            </button>
          </div>
        </form>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchSavedReplies")}
          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-hidden"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <CardListSkeleton rows={3} />
      ) : savedReplies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary">
            <MessageSquareCode className="size-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("noSavedReplies")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {savedReplies.map((reply) => (
            <div
              key={reply.id}
              className="flex items-start justify-between rounded-2xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {reply.title}
                  </span>
                  {reply.shortcut && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      /{reply.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                  {reply.text}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => handleStartEdit(reply)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={t("edit")}
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(reply.id)}
                  className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                  title={t("delete")}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
