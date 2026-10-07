"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSavedReplies, useInboxMutations } from "@/hooks/queries/useInbox";
import type { SavedReplyDTO } from "@/types/inbox";

interface SavedReplyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SavedReplyDialog({ open, onClose }: SavedReplyDialogProps) {
  const t = useTranslations("inbox");
  const [search, setSearch] = useState("");
  const { data: savedReplies = [], isLoading } = useSavedReplies(search);
  const mutations = useInboxMutations();

  const [editingReply, setEditingReply] = useState<SavedReplyDTO | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formShortcut, setFormShortcut] = useState("");
  const [formText, setFormText] = useState("");

  if (!open) return null;

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
          text: formText.trim(),
          shortcut: formShortcut.trim() || null,
        });
        toast.success(t("savedReplyCreated"));
      } else if (editingReply) {
        await mutations.updateSavedReply.mutateAsync({
          replyId: editingReply.id,
          body: {
            title: formTitle.trim(),
            text: formText.trim(),
            shortcut: formShortcut.trim() || null,
          },
        });
        toast.success(t("savedReplyUpdated"));
      }
      handleCancelForm();
    } catch {
      toast.error(t("savedReplySaveFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDeleteSavedReply"))) return;
    try {
      await mutations.deleteSavedReply.mutateAsync(id);
      toast.success(t("savedReplyDeleted"));
    } catch {
      toast.error(t("savedReplyDeleteFailed"));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{t("manageSavedReplies")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isCreating || editingReply ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="font-semibold text-foreground">
                {isCreating ? t("newSavedReply") : t("editSavedReply")}
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("savedReplyTitle")} *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t("savedReplyTitlePlaceholder")}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("savedReplyShortcut")}
                </label>
                <input
                  type="text"
                  value={formShortcut}
                  onChange={(e) => setFormShortcut(e.target.value)}
                  placeholder="/price"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("savedReplyText")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder={t("savedReplyTextPlaceholder")}
                  className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="h-9 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    mutations.createSavedReply.isPending ||
                    mutations.updateSavedReply.isPending
                  }
                  className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchSavedReplies")}
                    className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus size={16} />
                  <span>{t("newSavedReply")}</span>
                </button>
              </div>

              <div className="divide-y rounded-xl border bg-card">
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t("loading")}...
                  </div>
                ) : savedReplies.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t("noSavedReplies")}
                  </div>
                ) : (
                  savedReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start justify-between gap-4 p-4 hover:bg-muted/40"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {reply.title}
                          </span>
                          {reply.shortcut && (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                              {reply.shortcut}
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {reply.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(reply)}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          title={t("edit")}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(reply.id)}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title={t("delete")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
