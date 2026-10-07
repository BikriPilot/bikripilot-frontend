"use client";

import { useState } from "react";
import { Send, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useNotes, useInboxMutations } from "@/hooks/queries/useInbox";

interface NotesPanelProps {
  conversationId: string;
}

export function NotesPanel({ conversationId }: NotesPanelProps) {
  const t = useTranslations("inbox");
  const { data: notes = [], isLoading } = useNotes(conversationId);
  const mutations = useInboxMutations(conversationId);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || mutations.createNote.isPending) return;

    try {
      await mutations.createNote.mutateAsync(text.trim());
      setText("");
      toast.success(t("noteAdded"));
    } catch {
      toast.error(t("noteAddFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="w-full rounded-xl border bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || mutations.createNote.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send size={12} />
            <span>{t("addNote")}</span>
          </button>
        </div>
      </form>

      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            {t("loading")}...
          </div>
        ) : notes.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            {t("noNotes")}
          </div>
        ) : (
          notes.map((note) => {
            const dateStr = new Date(note.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <div
                key={note.id}
                className="rounded-xl border bg-card p-3 space-y-1.5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1 font-medium text-foreground">
                    <User size={12} />
                    <span>{note.author.name}</span>
                  </div>
                  <span>{dateStr}</span>
                </div>
                <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {note.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
